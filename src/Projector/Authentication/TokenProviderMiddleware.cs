using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using Newtonsoft.Json;
using System.IdentityModel.Tokens.Jwt;
using Projector.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace Projector.Authentication
{
    /**
     * The token provider middleware handles user authentication using JWTs.
     */
    public class TokenProviderMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly TokenProviderOptions _options;

        public TokenProviderMiddleware(
            RequestDelegate next,
            IOptions<TokenProviderOptions> options)
        {
            _next = next;
            _options = options.Value;
        }

        public Task Invoke(HttpContext context)
        {
            // If the request path doesn't match - skip.
            if (!context.Request.Path.Equals(_options.Path, StringComparison.Ordinal))
            {
                return _next(context);
            }

            context.Response.ContentType = "application/json";

            // Request must be POST with Content-Type: application/x-www-form-urlencoded
            if (!context.Request.Method.Equals("POST")
               || !context.Request.HasFormContentType)
            {
                context.Response.StatusCode = 400;
                return context.Response.WriteAsync(JsonConvert.SerializeObject(new
                {
                    ok = false,
                    message = "Bad request."
                }));
            }

            return GenerateToken(context);
        }

        private async Task GenerateToken(HttpContext context)
        {
            var email = context.Request.Form["email"];
            var password = context.Request.Form["password"];

            var userContext = context.RequestServices.GetService(typeof(ProjectorContext)) as ProjectorContext;

            var identity = await GetIdentity(userContext, email, password);
            if (identity == null)
            {
                context.Response.StatusCode = 400;
                await context.Response.WriteAsync(JsonConvert.SerializeObject(new
                {
                    ok = false,
                    message = "Invalid username or password."
                }));
                return;
            }

            var now = DateTime.UtcNow;

            // Specifically add the jti (random nonce), iat (issued timestamp), and sub (subject/user) claims.
            var claims = new Claim[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.Now.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
            };

            // Create the JWT and write it to a string.
            var jwt = new JwtSecurityToken(
                issuer: _options.Issuer,
                audience: _options.Audience,
                claims: claims,
                notBefore: now,
                expires: now.Add(_options.Expiration),
                signingCredentials: _options.SigningCredentials);
            var encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);

            context.Response.Cookies.Append("access_token", encodedJwt, new CookieOptions { HttpOnly = true, Expires = DateTimeOffset.Now.AddDays(1) });

            // Serialize and return the response.
            await context.Response.WriteAsync(JsonConvert.SerializeObject(new
            {
                ok = true,
                user = Utilities.Controllers.TrimUserForClient(identity),
            }));
        }
        static byte[] GetBytes(string str)
        {
            byte[] bytes = new byte[str.Length * sizeof(char)];
            Buffer.BlockCopy(str.ToCharArray(), 0, bytes, 0, bytes.Length);
            return bytes;
        }

        static string GetString(byte[] bytes)
        {
            char[] chars = new char[bytes.Length / sizeof(char)];
            System.Buffer.BlockCopy(bytes, 0, chars, 0, bytes.Length);
            return new string(chars);
        }
        private async Task<User> GetIdentity(ProjectorContext userContext, string email, string password)
        {
            SHA1 sha1 = SHA1.Create();
            password = GetString(sha1.ComputeHash(GetBytes(password)));
            //password = ToUnicode(password);
            var user = await userContext.User.FirstOrDefaultAsync(x => x.Email == email);
            
            if (user == null)
            {
                return null;
            }

            if (user.Password == password)
            {
                return user;
            }

            // Credentials are invalid, or account doesn't exist.
            return null;
        }
        private string ToUnicode(string str)
        {
            Encoding unicode = Encoding.Unicode;
            byte[] unicodeBytes = unicode.GetBytes(str);
            return (unicode.GetString(unicodeBytes, 0, unicodeBytes.Length));
        }
    }
}
