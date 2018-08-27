using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace Projector.Utilities
{
    public static class AsyncIO
    {
        /**
         * Reads all text from the file.
         */
        public static async Task<string> ReadAllTextAsync(string path, Encoding encoding)
        {
            using (var fs = new FileStream(path, FileMode.Open, FileAccess.Read))
            {
                using (var reader = new StreamReader(fs, encoding))
                {
                    return await reader.ReadToEndAsync();
                }
            }
        }

        /**
         * Writes text to a file using UTF-8 encoding.
         */
        public static async Task WriteAllTextAsync(string path, string contents, Encoding encoding)
        {
            using (var fs = new FileStream(path, FileMode.Create, FileAccess.Write))
            {
                using (var reader = new StreamWriter(fs, encoding))
                {
                    await reader.WriteAsync(contents);
                }
            }
        }
    }
}
