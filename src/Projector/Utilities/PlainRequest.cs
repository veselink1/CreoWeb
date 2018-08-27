using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;

namespace Projector.Utilities
{
    /**
     * Creates a simple request object from an HttpRequest.
     * Used when passing the request data as JSON to the server prerender module.
     */
    public class PlainRequest
    {
        public bool IsHttps { get; private set; }
        public IDictionary<string, IEnumerable<string>> Headers { get; private set; }
        public string Path { get; private set; }
        public string Query { get; private set; }

        public PlainRequest(HttpRequest request)
        {
            IsHttps = request.IsHttps;

            Headers = new Dictionary<string, IEnumerable<string>>();
            AddToDictionary(
                Headers,
                request.Headers
                .AsEnumerable()
                .Select(x => new KeyValuePair<string, IEnumerable<string>>(x.Key, x.Value)));

            Path = request.Path;
            Query = request.QueryString.ToString();
        }

        private static void AddToDictionary<TKey, TValue>(IDictionary<TKey, TValue> dictionary, IEnumerable<KeyValuePair<TKey, TValue>> enumerable)
        {
            foreach (var item in enumerable)
            {
                dictionary.Add(item);
            }
        }
    }
}
