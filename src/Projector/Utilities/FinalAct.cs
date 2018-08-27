using System;
using System.Threading;

namespace Projector.Utilities
{
    public class FinalAct : IDisposable
    {
        private Action _action;

        public FinalAct(Action action)
        {
            _action = action;
        }

        void IDisposable.Dispose()
        {
            Interlocked.Exchange(ref _action, null)?.Invoke();
        }
    }
}
