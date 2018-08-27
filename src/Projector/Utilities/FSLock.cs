using System;
using System.IO;
using System.Threading.Tasks;

namespace Projector.Utilities
{
    public static class LockFile
    {
        public static Task<IDisposable> LockAsync(string lockFile)
        {
            if (Path.GetFileName(lockFile).Length == 0)
            {
                throw new ArgumentException($"{nameof(lockFile)}: {lockFile}");
            }

            Directory.CreateDirectory(Path.GetDirectoryName(lockFile));
            
            TaskCompletionSource<IDisposable> tcs = new TaskCompletionSource<IDisposable>();

            Action action = null;
            action = async delegate
            {
                try
                {
                    using (var fs = File.Open(lockFile, FileMode.CreateNew))
                    {
                        fs.Dispose();
                    }

                    tcs.TrySetResult(new FinalAct(delegate
                    {
                        File.Delete(lockFile);
                    }));
                }
                catch (Exception e)
                {
                    await Task.Delay(40);
                    action();
                }
            };
            action();

            return tcs.Task;
        }
    }
}
