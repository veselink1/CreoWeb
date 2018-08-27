using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Projector.Services
{
    public interface IUserPackageManager
    {
        /**
         * Remove all user packages.
         */
        Task RemoveAllPackagesAsync(string userId, string projectName);

        /**
         * Install a package asynchronously.
         */
        Task AddPackageAsync(string userId, string projectName, string packageName);

        /**
         * Uninstall a package asynchronously.
         */
        Task RemovePackageAsync(string userId, string projectName, string packageName);

        /**
         * Get a file stream to the package config asynchronously.
         */
        Task<FileStream> GetPackageConfigAsync(string userId, string projectName);

        /**
         * Get a file stream to the package bundle asynchronously.
         */
        Task<FileStream> GetPackageBundleAsync(string userDomain, string project);

        /*
         * Check if the project has been initialized.
         */
        bool IsInitialized(string userId, string projectName);
    }
}
