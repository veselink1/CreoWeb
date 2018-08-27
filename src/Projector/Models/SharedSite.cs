using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Projector.Models
{
    public class SSites
    {
        public List<SharedObject> Shared { get; set; }
        public List<SharedObject> Accepted { get; set; }
    }

    public class SharedObject
    {
        public int ID { get; set; }
        public int AccessLevel { get; set; }
    }
}
