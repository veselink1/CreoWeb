using System.IO;
using System.IO.Compression;
using System.Threading.Tasks;

namespace Projector.Services
{
    public interface IUserWwwManager
    {
        ContentStream Get(string website, string path);
        Task UpdateAsync(string website, string dataRoot);
        Task UpdateAsync(string website, ZipArchive archive);
    }

    public class ContentStream
    {
        public FileStream FileStream { get; private set; }
        public string ContentType { get; private set; }

        public ContentStream(FileStream fileStream, string contentType)
        {
            FileStream = fileStream;
            ContentType = contentType;
        }
    }
}
