using System;

namespace Projector.Utilities
{
    public class EndUserException : Exception
    {
        public string FormattedMessage { get; private set; }

        public EndUserException(string formattedMessage)
            : base(formattedMessage)
        {
            FormattedMessage = formattedMessage;
        }

        public EndUserException(string formattedMessage, Exception internalException)
            : base(formattedMessage, internalException)
        {
            FormattedMessage = formattedMessage;
        }
    }
}
