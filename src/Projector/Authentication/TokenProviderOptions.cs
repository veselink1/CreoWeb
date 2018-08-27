using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.IdentityModel.Tokens;

namespace Projector.Authentication
{
    /**
     * The options of the token provider service.
     */
    public class TokenProviderOptions
    {
        // The path at witch the token was created.
        public string Path { get; set; }

        // The issuer claim of the token.
        public string Issuer { get; set; }

        // The audience claim of the token.
        public string Audience { get; set; }

        // The expiration period of the token.
        public TimeSpan Expiration { get; set; }

        // The signin credentials.
        public SigningCredentials SigningCredentials { get; set; }
    }
}
