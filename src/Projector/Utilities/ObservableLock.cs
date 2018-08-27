using System;
using System.Threading;

namespace Projector.Utilities
{
    public class ObservableLock
    {
        private volatile bool _isHeld = false;
        private readonly object _syncRoot = new object();

        public bool IsHeld { get => _isHeld; }

        public IDisposable Lock()
        {
            Monitor.Enter(_syncRoot);
            _isHeld = true;
            return new FinalAct(Unlock);
        }

        private void Unlock()
        {
            _isHeld = false;
            Monitor.Exit(_syncRoot);
        }
    }
}
