using Newtonsoft.Json;
using Projector.Utilities;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using System.Text;
using Microsoft.AspNetCore.Hosting;

namespace Projector.Services
{
    public class UserFileManager : IUserFileManager
    {
        private readonly IHostingEnvironment _env;
        // The root path of the user's files folder.
        private readonly string _storagePath;

        public UserFileManager(IHostingEnvironment env)
        {
            _env = env;
            _storagePath = $"{env.ContentRootPath}\\Priv\\users";
        }

        private void ThrowNotFound(string projectName, string filePath)
        {
            throw new FileNotFoundException("The file \"" + filePath + "\" was not found in \"" + projectName + "\".");
        }

        async Task<IReadOnlyList<UserFile>> IUserFileManager.GetFilesAsync(string userId, string projectName)
        {
            // Get the base files directory.
            string baseDir = GetBaseDir(userId, projectName);

            using (await LockFile.LockAsync(GetLockFile(userId, projectName)))
            {
                try
                {
                    return await GetUserFilesAsync(userId, projectName);
                }
                catch (FileNotFoundException e)
                {
                    return new List<UserFile>();
                }
            }
        }

        async Task<UserFileStream> IUserFileManager.ReadAsync(string userId, string projectName, string filePath)
        {
            // Get the base files directory.
            string baseDir = GetBaseDir(userId, projectName);

            using (await LockFile.LockAsync(GetLockFile(userId, projectName)))
            {
                var fileMetaList = await GetUserFilesAsync(userId, projectName);

                if (fileMetaList.TryFind(x => x.VirtualPath == filePath, out var fileMeta))
                {
                    return new UserFileStream
                    (
                        stream: File.OpenRead($"{baseDir}\\{fileMeta.LocalPath}"),
                        metaData: fileMeta
                    );
                }
                else
                {
                    ThrowNotFound(projectName, filePath);
                    throw null;
                }
            }
        }

        async Task<UserFile> IUserFileManager.WriteAsync(string userId, string projectName, string filePath, Stream data, string contentType)
        {
            // Get the base files directory.
            string baseDir = GetBaseDir(userId, projectName);

            using (await LockFile.LockAsync(GetLockFile(userId, projectName)))
            {
                List<UserFile> fileMetaList = null;
                try
                {
                    fileMetaList = await GetUserFilesAsync(userId, projectName);
                }
                catch (Exception e)
                {
                    await AsyncIO.WriteAllTextAsync($"{baseDir}\\filemeta.json", "[]", Encoding.UTF8);
                    fileMetaList = new List<UserFile>();
                }
                
                if (fileMetaList.TryFind(x => x.VirtualPath == filePath, out var _))
                {
                    return await OverwriteFileAsync(baseDir, fileMetaList, filePath, data, contentType);
                }
                else
                {
                    return await WriteNewFileAsync(baseDir, fileMetaList, filePath, data, contentType);
                }
            }
        }

        private async Task<UserFile> OverwriteFileAsync(string baseDir, List<UserFile> fileMetaList, string filePath, Stream data, string contentType)
        {
            UserFile file = fileMetaList.Find(x => x.VirtualPath == filePath);
            string realFileName = file.LocalPath;
            string realPath = $"{baseDir}\\{realFileName}";

            await WriteWithBackupAsync(realPath, data);

            UserFile updatedFile = new UserFile(file.VirtualPath, file.LocalPath, fileSize: data.Position, contentType: contentType);
            fileMetaList.Remove(file);
            fileMetaList.Add(updatedFile);

            // Write the new file meta back to the file.
            await AsyncIO.WriteAllTextAsync($"{baseDir}\\filemeta.json", JsonConvert.SerializeObject(fileMetaList), Encoding.UTF8);
            // Return the updated file.
            return updatedFile;
        }

        private async Task<UserFile> WriteNewFileAsync(string baseDir, List<UserFile> fileMetaList, string filePath, Stream data, string contentType)
        {
            // Generate a new file name.
            string realFileName = GenerateFilename();

            try
            {
                using (FileStream fs = File.Create($"{baseDir}\\{realFileName}"))
                {
                    await data.CopyToAsync(fs);
                }
            }
            catch (Exception e)
            {
                File.Delete($"{baseDir}{realFileName}");
                throw e;
            }

            var file = new UserFile
            (
                virtualPath: filePath,
                localPath: realFileName,
                fileSize: data.Position,
                contentType: contentType
            );

            // Add the file to the meta.
            fileMetaList.Add(file);

            // Write the new file meta back to the file.
            await AsyncIO.WriteAllTextAsync($"{baseDir}\\filemeta.json", JsonConvert.SerializeObject(fileMetaList), Encoding.UTF8);
            return file;
        }

        private async Task WriteWithBackupAsync(string realPath, Stream data)
        {
            string backupPath = realPath + ".bak";
            try
            {
                // Create the backup file.
                await CopyFileAsync(from: realPath, to: backupPath);
                // Overwrite the old data.
                using (FileStream fs = File.Open(realPath, FileMode.Truncate))
                {
                    await data.CopyToAsync(fs);
                }

                File.Delete(backupPath);
            }
            catch (Exception e)
            {
                if (File.Exists(backupPath))
                {
                    await CopyFileAsync(from: backupPath, to: realPath);
                    File.Delete(backupPath);
                }
                throw e;
            }
        }

        private async Task CopyFileAsync(string from, string to)
        {
            using (FileStream fromStream = File.OpenRead(from))
            {
                using (FileStream toStream = File.OpenWrite(to))
                {
                    await fromStream.CopyToAsync(toStream);
                }
            }
        }

        async Task IUserFileManager.DeleteAsync(string userId, string projectName, string filePath)
        {
            // Get the base files directory.
            string baseDir = GetBaseDir(userId, projectName);

            using (await LockFile.LockAsync(GetLockFile(userId, projectName)))
            {
                var fileMetaList = await GetUserFilesAsync(userId, projectName);
                if (fileMetaList.TryFind(x => x.VirtualPath == filePath, out var fileMeta))
                {
                    File.Delete($"{baseDir}\\{fileMeta.LocalPath}");
                    // Remove from the list.
                    fileMetaList.Remove(fileMeta);
                }
                // Write the new file meta back to the file.
                await AsyncIO.WriteAllTextAsync($"{baseDir}\\filemeta.json", JsonConvert.SerializeObject(fileMetaList), Encoding.UTF8);
            }
        }

        async Task IUserFileManager.RenameAsync(string userId, string projectName, string oldFilePath, string newFilePath)
        {
            // Get the base files directory.
            string baseDir = GetBaseDir(userId, projectName);

            using (await LockFile.LockAsync(GetLockFile(userId, projectName)))
            {
                string fileMetaJson = null;
                try
                {
                    // Read the metadata file.
                    fileMetaJson = await AsyncIO.ReadAllTextAsync($"{baseDir}\\filemeta.json", Encoding.UTF8);
                }
                catch (FileNotFoundException e)
                {
                    ThrowNotFound(projectName, oldFilePath);
                }
                // Get the file meta dict.
                List<UserFile> fileMetaList = JsonConvert.DeserializeObject<List<UserFile>>(fileMetaJson);
                if (fileMetaList.TryFind(x => x.VirtualPath == oldFilePath, out var fileMeta))
                {
                    // Update the value in the list.
                    fileMetaList.Remove(fileMeta);
                    fileMetaList.Add(fileMeta.WithVirtualPath(newFilePath));
                }
                // Write the new file meta back to the file.
                await AsyncIO.WriteAllTextAsync($"{baseDir}\\filemeta.json", JsonConvert.SerializeObject(fileMetaList), Encoding.UTF8);
            }
        }

        /**
         * Get the storage path for the specified user and project name.
         */
        private string GetBaseDir(string userId, string projectName)
        {
            string dir = $"{_storagePath}\\{userId}\\{projectName}\\files";
            Directory.CreateDirectory(dir);
            return dir;
        }

        private string GetLockFile(string userId, string projectName)
        {
            return $"{GetBaseDir(userId, projectName)}\\user.lock";
        }

        private async Task<List<UserFile>> GetUserFilesAsync(string userId, string projectName)
        {
            string fileMetaJson = await AsyncIO.ReadAllTextAsync($"{GetBaseDir(userId, projectName)}\\filemeta.json", Encoding.UTF8);
            // Get the file meta list.
            return JsonConvert.DeserializeObject<List<UserFile>>(fileMetaJson);
        }

        private string GenerateFilename()
        {
            return Guid.NewGuid().ToString() + ".dat";
        }
    }
}
