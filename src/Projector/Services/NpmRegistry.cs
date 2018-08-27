using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Net.Http;

namespace Projector.Services
{
    public class NpmRegistry : INpmRegistry
    {
        /**
         * Checks whether the package exists in the main NPM repository. 
         */
        public async Task<bool> PackageExists(string packageName)
        {
            HttpClient http = new HttpClient();
            HttpResponseMessage res = await http.GetAsync($"https://www.npmjs.com/package/" + Uri.EscapeUriString(packageName));
            return res.IsSuccessStatusCode;
        }
    }
}
