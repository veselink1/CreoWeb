using System;
using System.Collections.Concurrent;
using System.IO;
using System.IO.Compression;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.StaticFiles;

namespace Projector.Services
{
    public class UserWwwManager : IUserWwwManager
    {
        private readonly IHostingEnvironment _env;
        private readonly FileExtensionContentTypeProvider _fileExtMimeProvider;
        private readonly string _storagePath;
        private readonly ConcurrentDictionary<string, object> _updateLocks;

        public UserWwwManager(IHostingEnvironment env)
        {
            _env = env;
            _fileExtMimeProvider = new FileExtensionContentTypeProvider();
            _storagePath = $"{_env.ContentRootPath}\\Priv\\websites";
            _updateLocks = new ConcurrentDictionary<string, object>();
        }

        public ContentStream Get(string website, string path)
        {
            if (!Uri.IsWellFormedUriString($"file:///C:/{path}", UriKind.Absolute))
            {
                throw new FileNotFoundException();
            }

            if (path == null)
            {
                path = "index.html";
            }
            else
            {
                path = path.Replace("/", "\\");
            }

            Func<ContentStream> getContentStream = delegate
            {
                FileStream fileStream = File.OpenRead($"{_storagePath}\\{website}\\{path}");
                string contentType = GetContentType(path);
                return new ContentStream(fileStream, contentType);
            };

            if (_updateLocks.TryGetValue(website, out var updateLock))
            {
                lock (updateLock)
                {
                    return getContentStream();
                }
            }
            else
            {
                return getContentStream();
            }
        }

        public Task UpdateAsync(string website, string dataRoot)
        {
            return Task.Run(delegate
            {
                lock (_updateLocks.GetOrAdd(website, CreateLock))
                {
                    try
                    {
                        string websiteRoot = GetWebsiteRoot(website);
                        string backupDir = GetTempDirectory();

                        if (Directory.Exists(websiteRoot))
                        {
                            try
                            {
                                Directory.Move(websiteRoot, backupDir);
                            }
                            catch (Exception e)
                            {
                                Directory.Delete(backupDir, recursive: true);
                                throw e;
                            }

                            try
                            {
                                Directory.Move(dataRoot, websiteRoot);
                            }
                            catch (Exception e)
                            {
                                UpdateAsync(website, backupDir).Wait();
                                throw e;
                            }
                        }
                        else
                        {
                            try
                            {
                                Directory.Move(dataRoot, websiteRoot);
                            }
                            catch (Exception e)
                            {
                                Directory.Delete(websiteRoot, recursive: true);
                                Directory.CreateDirectory(websiteRoot);
                                throw e;
                            }
                        }
                    }
                    finally
                    {
                        _updateLocks.TryRemove(website, out var _);
                    }
                }
            });
        }

        public async Task UpdateAsync(string website, ZipArchive archive)
        {
            var destDir = GetTempDirectory();
            Directory.CreateDirectory(destDir);
            archive.ExtractToDirectory(destDir);

            try
            {
                await UpdateAsync(website, destDir);
            }
            finally
            {
                try
                {
                    Directory.Delete(destDir, recursive: true);
                }
                catch (Exception ignored) { }
            }
        }

        private string GetContentType(string path)
        {
            if (_fileExtMimeProvider.TryGetContentType(Path.GetFileName(path), out var contentType))
            {
                return contentType;
            }
            else
            {
                return "application/octet-stream";
            }
        }

        private string GetTempDirectory() => Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

        private string GetWebsiteRoot(string website) => $"{_storagePath}\\{website}";

        private static object CreateLock(string _) => new object();
    }
}
