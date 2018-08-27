using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Projector.Services;
using Projector.Models;
using System.IO;
using Newtonsoft.Json.Linq;
using Microsoft.Net.Http.Headers;
using Projector.Utilities;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace Projector.Controllers
{
    // This is the user packages API controller.
    // It manages the installation and removal of the user's NPM packages.
    [Route("api/[controller]")]
    public class UserPackagesController : Controller
    {
        // An instance to the NPMRegistry service.
        private readonly INpmRegistry _npm;
        // An instance to the UserPacakgeManager service.
        private readonly IUserPackageManager _pacman;
        // An instance to the Database service.
        private readonly ProjectorContext _db;

        // Construct the UserPackagesController using instances to it's dependencies using Dependency Injection.
        public UserPackagesController(INpmRegistry npm, IUserPackageManager pacman, ProjectorContext db)
        {
            _npm = npm;
            _pacman = pacman;
            _db = db;
        }

        // POST api/userpackages/project-name/install/my-package
        // This route handles the installation of a package.
        [Authorize]
        [HttpPost("{project}/install/{package}")]
        public async Task<object> PostInstall(int project, string package)
        {
            // If the package does not exist in the NPM registry,
            // return an error message.
            bool exists = await _npm.PackageExists(package);
            if (!exists)
            {
                return new
                {
                    ok = false,
                    message = "Package \"" + package + "\" does not exist in the NPM repository.",
                    url = $"/api/userpackages/{project}/bundle",
                    packageUrl = $"/api/userpackages/{project}/config",
                    bundleUrl = $"/api/userpackages/{project}/bundle",
                };
            }
            else
            {
                // The user domain consists of the user's email address, where the @ symbol is replaced by -at-.
                var userDomain = HttpContext.User.Claims.First().Value.Replace("@", "-at-");

                // Add the package asynchronously.
                try
                {
                    await _pacman.AddPackageAsync(userDomain, project.ToString(), package);
                    // If the installation succeeded, return an OK message.
                    return new
                    {
                        ok = true,
                        message = "The package was installed successfully.",
                        url = $"/api/userpackages/{project}/bundle",
                        packageUrl = $"/api/userpackages/{project}/config",
                        bundleUrl = $"/api/userpackages/{project}/bundle",
                    };
                }
                catch (EndUserException e)
                {
                    // If the installation failed, return an Error message.
                    return new
                    {
                        ok = false,
                        message = e.FormattedMessage,
                        url = $"/api/userpackages/{project}/bundle",
                        packageUrl = $"/api/userpackages/{project}/config",
                        bundleUrl = $"/api/userpackages/{project}/bundle",
                    };
                }
                catch (Exception e)
                {
                    throw e;
                }
            }
        }


        // POST api/userpackages/project-name/uninstall/my-package
        // This route handles the uninstallation of a package.
        [Authorize]
        [HttpPost("{project}/uninstall/{package}")]
        public async Task<object> PostUninstall(int project, string package)
        {
            // If the package does not exist in the NPM registry,
            // return an error message.
            bool exists = await _npm.PackageExists(package);
            if (!exists)
            {
                return new
                {
                    ok = false,
                    message = "Package \"" + package + "\" does not exist in the NPM repository.",
                    packageUrl = $"/api/userpackages/{project}/config",
                    bundleUrl = $"/api/userpackages/{project}/bundle",
                };
            }
            else
            {
                // The user domain consists of the user's email address, where the @ symbol is replaced by -at-.
                var userDomain = HttpContext.User.Claims.First().Value.Replace("@", "-at-");

                try
                {
                    // Remove the package asynchronously.
                    await _pacman.RemovePackageAsync(userDomain, project.ToString(), package);
                        // If the uninstallation succeeded, return an OK message.
                        return new
                        {
                            ok = true,
                            message = "The package was removed successfully.",
                            packageUrl = $"/api/userpackages/{project}/config",
                            bundleUrl = $"/api/userpackages/{project}/bundle",
                        };
                }
                catch (EndUserException e)
                {
                    // If the uninstallation failed, return an Error message.
                    return new
                    {
                        ok = false,
                        message = e.FormattedMessage,
                        packageUrl = $"/api/userpackages/{project}/config",
                        bundleUrl = $"/api/userpackages/{project}/bundle",
                    };
                }
                catch (Exception e)
                {
                    throw e;
                }
            }
        }

        // GET api/userpackages/my-project/config
        // This route allows the user to get the package.json file of it's project.
        [Authorize]
        [HttpGet("{project}/config")]
        public async Task<IActionResult> GetPackageConfigAsync(int project)
        {
            var userDomain = HttpContext.User.Claims.First().Value.Replace("@", "-at-");
            // Simply return a file stream to the package.json file.
            return new FileStreamResult(await _pacman.GetPackageConfigAsync(userDomain, project.ToString()), "application/json");
        }

        // GET api/userpackages/my-project/bundle
        // This route allows the user to access it's project's package bundle,
        // that contains all of the user's packages.
        [Authorize]
        [HttpGet("{project}/bundle")]
        public async Task<IActionResult> GetPackageBundleAsync(int project)
        {
            var userDomain = HttpContext.User.Claims.First().Value.Replace("@", "-at-");
            // Simply return a file stream to the bundle.
            return new FileStreamResult(await _pacman.GetPackageBundleAsync(userDomain, project.ToString()), "text/javascript");
        }

        // GET api/userpackages/my-project/initialized
        // This route allows the user to check if it's project has been initialized.
        [Authorize]
        [HttpGet("{project}/initialized")]
        public object GetIsInitialized(int project)
        {
            var userDomain = HttpContext.User.Claims.First().Value.Replace("@", "-at-");
            bool isInitialized = _pacman.IsInitialized(userDomain, project.ToString());

            // Return the initialization state of the project, the route to access the bundle and the route to access the config.
            return new
            {
                initialized = isInitialized,
                packageUrl = $"/api/userpackages/{project}/config",
                bundleUrl = $"/api/userpackages/{project}/bundle",
            };
        }


    }
}
