using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Projector.Utilities;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;

namespace Projector.Services
{
    public class UserPackageManager : IUserPackageManager
    {
        private IHostingEnvironment _env;
        // The root path of the user's packages folder.
        private readonly string _storagePath;
        private string _yarnPath;
        private string _webpackPath;

        public UserPackageManager(IHostingEnvironment env)
        {
            _env = env;
            _storagePath = $"{_env.ContentRootPath}\\Priv\\users";
            _yarnPath = $"{_env.ContentRootPath}\\Priv\\yarn\\yarn.cmd";
            _webpackPath = $"{_env.ContentRootPath}\\Priv\\webpack\\webpack.cmd";
        }

        private async Task<bool> TryInstallYarnAsync()
        {
            if (File.Exists(_yarnPath))
            {
                return true;
            }

            try
            {
                Process proc = StartProcess("npm install yarn@0.21.3 --global --prefix ./Priv/yarn", _env.ContentRootPath);
                await WaitForExitAsync(proc);
                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }

        private async Task<bool> TryInstallWebpackAsync()
        {
            if (File.Exists(_webpackPath))
            {
                return true;
            }

            try
            {
                Process proc = StartProcess("npm install webpack@2.3.2 --global --prefix ./Priv/webpack", _env.ContentRootPath);
                await WaitForExitAsync(proc);
                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }

        private async Task<bool> TryInstallToolsAsync()
        {
            return await TryInstallYarnAsync() && await TryInstallWebpackAsync();
        }

        /**
         * Get the storage path for the specified user and project name.
         */
        private string GetBaseDir(string userId, string projectName)
        {
            return $"{_storagePath}\\{userId}\\{projectName}\\packages";
        }

        private Process StartProcess(string command, string pwd)
        {
            var psi = new ProcessStartInfo("cmd.exe")
            {
                Arguments = $"/c \"cd {pwd} && {command}\"",
                WorkingDirectory = pwd,
                UseShellExecute = false,
                CreateNoWindow = true,
                RedirectStandardInput = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
            };

            return Process.Start(psi);
        }

        // Asynchronously wait for the process exit.
        private Task WaitForExitAsync(Process proc)
        {
            TaskCompletionSource<byte> tcs = new TaskCompletionSource<byte>();
            try
            {
                proc.EnableRaisingEvents = true;
                proc.Exited += delegate
                {
                    tcs.TrySetResult(0);
                };
            }
            catch (Exception e)
            {
                tcs.TrySetException(e);
            }
            return tcs.Task;
        }

        /**
         * Initializes the project if it has not already been initialized.
         */
        private async Task TryInitProjectAsync(string pwd, string userId, string projectName)
        {
            if (!Directory.Exists(pwd))
            {
                using (await LockFile.LockAsync(GetLockFile(userId, projectName)))
                {
                    await TryInstallToolsAsync();
                    Directory.CreateDirectory(pwd);
                    await AsyncIO.WriteAllTextAsync(pwd + "\\package.json", "{\"name\":\"creo-web-" + userId + "-" + projectName + "\",\"version\":\"1.0.0\",\"dependencies\":{}}", Encoding.UTF8);
                }
            }
        }

        /**
         * Install a package asynchronously.
         */
        public async Task AddPackageAsync(string userId, string projectName, string packageName)
        {
            var pwd = $"{GetBaseDir(userId, projectName)}";
            await TryInitProjectAsync(pwd, userId, projectName);

            using (await LockFile.LockAsync(GetLockFile(userId, projectName)))
            {
                try
                {
                    Process proc = StartProcess($"{_yarnPath} add {packageName} --exact", pwd);
                    await WaitForExitAsync(proc);

                    await TransformFilesAsync(pwd);

                    string output = await proc.StandardOutput.ReadToEndAsync();
                }
                catch (Exception e)
                {
                    throw new EndUserException("Internal error occured durning the install of \"{packageName}\".", e);
                }
            }
        }

        /**
         * Uninstall a package asynchronously.
         */
        public async Task RemovePackageAsync(string userId, string projectName, string packageName)
        {
            var pwd = $"{GetBaseDir(userId, projectName)}";
            if (!Directory.Exists(pwd))
            {
                throw new EndUserException("The package has already been removed.");
            }

            using (await LockFile.LockAsync(GetLockFile(userId, projectName)))
            {
                try
                {
                    Process proc = StartProcess($"\"{_yarnPath}\" remove {packageName}", pwd);
                    await WaitForExitAsync(proc);

                    await TransformFilesAsync(pwd);

                    string output = await proc.StandardOutput.ReadToEndAsync();
                }
                catch (Exception e)
                {
                    throw new EndUserException("Internal error occured durning the uninstall of \"{packageName}\".", e);
                }
            }
        }

        /**
         * Get a map of the project's dependencies.
         */
        private async Task<IDictionary<string, string>> GetPackageDependenciesAsync(string pwd)
        {
            var packageJsonPath = $"{pwd}\\package.json";

            if (!File.Exists(packageJsonPath))
            {
                return new Dictionary<string, string>();
            }
            else
            {
                var package = JObject.Parse(await AsyncIO.ReadAllTextAsync(packageJsonPath, Encoding.UTF8));
                var deps = package["dependencies"];
                var dict = JsonConvert.DeserializeObject<Dictionary<string, string>>(deps.ToString());
                return dict;
            }
        }

        private async Task<dynamic> GetModuleInfoAsync(string pwd, string module)
        {
            string json = await AsyncIO.ReadAllTextAsync($"{pwd}\\node_modules\\{module}\\package.json", Encoding.UTF8);
            return JsonConvert.DeserializeObject(json);
        }

        private async Task<string> GetModuleEntryAsync(string pwd, string module)
        {
            dynamic info = await GetModuleInfoAsync(pwd, module);
            string entry = info.main;
            if (string.IsNullOrEmpty(entry))
            {
                return "index.js";
            }
            else
            {
                return entry;
            }
        }

        private string VariantsToRegex(IEnumerable<string> variants)
        {
            return string.Join("|", variants);
        }

        /**
         * Launch the file transformation process (webpack).
         */
        private async Task TransformFilesAsync(string pwd)
        {
            IDictionary<string, string> dependencies = await GetPackageDependenciesAsync(pwd);
            IList<string> entries = new List<string>();

            IList<string> switchCases = new List<string>();

            foreach (var module in dependencies.Keys)
            {
                string relativeEntry = await GetModuleEntryAsync(pwd, module);
                string moduleEntry = module + "/" + relativeEntry;
                switchCases.Add($"case '{module}': return require('{moduleEntry}');");
            }

            string switchBody = $"{string.Join("\n", switchCases)} default: throw new Error('Unknown module \"' + moduleId + '\"!'); ";
            string moduleSwitch = $"switch(moduleId) {{ {switchBody} }}";
            string js = $"self[\"__cwuser_require__\"] = function(moduleId) {{ {moduleSwitch} }}";

            var wbIndex = $"{pwd}\\index.js";
            await AsyncIO.WriteAllTextAsync(wbIndex, js, Encoding.UTF8);

            var cmd = $"{_webpackPath} index.js bundle.js";
            Process proc = StartProcess(cmd, pwd);
            await WaitForExitAsync(proc);
        }

        /**
         * Remove all user packages.
         */
        public async Task RemoveAllPackagesAsync(string userId, string projectName)
        {
            var pwd = $"{GetBaseDir(userId, projectName)}";

            await Task.Run(() =>
            {
                try
                {
                    Directory.Delete(pwd, true);
                }
                catch (Exception e)
                {
                    throw new EndUserException("Internal error occurred durning the removal of some user packages.", e);
                }
            });
        }

        /*
         * Check if the project has been initialized.
         */
        public bool IsInitialized(string userId, string projectName)
        {
            var pwd = $"{GetBaseDir(userId, projectName)}";

            return Directory.Exists(pwd) && File.Exists($"{pwd}\\package.json");
        }

        /**
         * Get a file stream to the package config asynchronously.
         */
        public async Task<FileStream> GetPackageConfigAsync(string userId, string projectName)
        {
            var pwd = $"{GetBaseDir(userId, projectName)}";
            await TryInitProjectAsync(pwd, userId, projectName);

            return new FileStream($"{pwd}\\package.json", FileMode.Open);
        }

        /**
         * Get a file stream to the package bundle asynchronously.
         */
        public async Task<FileStream> GetPackageBundleAsync(string userId, string projectName)
        {
            var pwd = $"{GetBaseDir(userId, projectName)}";
            await TryInitProjectAsync(pwd, userId, projectName);

            return new FileStream($"{pwd}\\bundle.js", FileMode.OpenOrCreate);
        }

        private string GetLockFile(string userId, string projectName)
        {
            return $"{GetBaseDir(userId, projectName)}\\user.lock";
        }
    }
}
