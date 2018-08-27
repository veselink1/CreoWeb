using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Projector.Models;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using System.Text;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Projector.Controllers
{
    [Route("api/User")]
    public class UserController : Controller
    {
        private ProjectorContext _context;
        public UserController(ProjectorContext context)
        {
            _context = context;
        }

        // GET: api/values
        [HttpPost]
        public object AddUser([FromBody]User user)
        {
            SHA1 sha1 = SHA1.Create();
            user.Password = GetString(sha1.ComputeHash(GetBytes(user.Password)));
            //user.Password = ToUnicode(user.Password);
            //user.FirstName = ToUnicode(user.FirstName);
            //user.LastName = ToUnicode(user.LastName);
            //user.Username = ToUnicode(user.Username);
            user.RegisterDate = DateTime.Now;
            user.Storage = 32;
            user.SharedSites = "{\"Shared\": [],\"Accepted\": []}";
            user.AccountPicture = "";
            _context.User.Add(user);
            _context.SaveChanges();
            return new { Success = true };            
        }

        [Authorize]
        [HttpGet("Authentication")]
        public object GetAuthentication()
        {
            var email = HttpContext.User.Claims.First().Value;
            var user = _context.User.First(x => x.Email == email);
            return new
            {
                ok = true,
                user = Utilities.Controllers.TrimUserForClient(user)
            };
        }

        [HttpGet("Logout")]
        public object Logout()
        {
            if (HttpContext.User != null && HttpContext.User.Claims.Count() > 0)
            {
                CookieOptions options = new CookieOptions();
                options.Expires = DateTime.Now.AddDays(-1);
                Response.Cookies.Append("access_token", "", options);
            }
            return new
            {
                ok = true,
            };
        }

        [HttpPost("CheckUser")]
        public object CheckUser([FromBody]User user)
        {
            bool usernameExists = _context.User.Any(x => x.Username == user.Username);
            bool emailExists = _context.User.Any(x => x.Email == user.Email);
            return new { UsernameExists = usernameExists, EmailExists = emailExists };
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
            Buffer.BlockCopy(bytes, 0, chars, 0, bytes.Length);
            return new string(chars);
        }
        private string ToUnicode(string str)
        {
            Encoding unicode = Encoding.Unicode;
            byte[] unicodeBytes = unicode.GetBytes(str);
            return (unicode.GetString(unicodeBytes, 0, unicodeBytes.Length));
        }
    }
}
