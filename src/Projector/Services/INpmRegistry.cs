using System.Threading.Tasks;

namespace Projector.Services
{
    public interface INpmRegistry
    {
        /**
         * Checks whether the package exists in the main NPM repository. 
         */
        Task<bool> PackageExists(string packageName);
    }
}