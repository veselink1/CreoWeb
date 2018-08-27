using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Projector.Services
{
    public interface IUserFileManager
    {
        Task<UserFileStream> ReadAsync(string userId, string projectName, string filePath);
        Task<UserFile> WriteAsync(string userId, string projectName, string filePath, Stream data, string contentType);
        Task DeleteAsync(string userId, string projectName, string filePath);
        Task RenameAsync(string userId, string projectName, string oldFilePath, string newFilePath);
        Task<IReadOnlyList<UserFile>> GetFilesAsync(string userId, string projectName);
    }

    public class UserFile
    {
        public string VirtualPath { get; private set; }
        public string LocalPath { get; private set; }
        public long FileSize { get; private set; }
        public string ContentType { get; private set; }

        public UserFile(string virtualPath, string localPath, long fileSize, string contentType)
        {
            VirtualPath = virtualPath;
            LocalPath = localPath;
            FileSize = fileSize;
            ContentType = contentType;
        }

        public UserFile WithVirtualPath(string virtualPath)
        {
            return new UserFile
            (
                virtualPath: virtualPath,
                localPath: LocalPath,
                fileSize: FileSize,
                contentType: ContentType
            );
        }
    }

    public class UserFileStream
    {
        public FileStream Stream { get; private set; }
        public UserFile MetaData { get; private set; }

        public UserFileStream(FileStream stream, UserFile metaData)
        {
            Stream = stream;
            MetaData = metaData;
        }
    }
}
