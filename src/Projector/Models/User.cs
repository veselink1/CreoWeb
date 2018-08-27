using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
namespace Projector.Models
{
    public partial class User
    {
        public int ID { get; set; }
        public string Username { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public DateTime RegisterDate { get; set; }
        public DateTime BirthDate { get; set; }
        public int Storage { get; set; }
        public string SharedSites { get; set; }
        public string AccountPicture { get; set; }
       /* public int size { get; set; }
        public int GetSize()
        {
            return 4 + Username.Length * 2 + FirstName.Length * 2 + LastName.Length * 2 + Password.Length * 2 + Email.Length * 2 + 3 + 3 + 4 + SharedSites.Length * 2 + AccountPicture.Length * 2;
        }*/
    }
}
