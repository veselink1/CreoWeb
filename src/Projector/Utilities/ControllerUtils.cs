using Projector.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Projector.Utilities
{
    public static class Controllers
    {
        /**
         * Creates a simpler user representation, ommiting any sensitive information.
         */
        public static object TrimUserForClient(User user)
        {
            return new
            {
                email = user.Email,
                username = user.Username,
                birthDate = user.BirthDate,
                firstName = user.FirstName,
                lastName = user.LastName,
            };
        }
    }
}
