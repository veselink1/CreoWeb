using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Projector.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Projector.Authentication;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.ResponseCompression;
using System.IO.Compression;
using Projector.Utilities;
using Projector.Services;

namespace Projector
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            // Create a new configuration builder and add the config filed to it.
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();

            // If the current hosting enviroment is "Development".
            if (env.IsDevelopment())
            {
                // Push telemetry data through the Application Insights pipeline in developer mode.
                builder.AddApplicationInsightsSettings(developerMode: true);
            }
            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // Add GZip response compression support.
            services.Configure<GzipCompressionProviderOptions>
                (options => options.Level = CompressionLevel.Fastest);
            services.AddResponseCompression(options =>
            {
                options.Providers.Add<GzipCompressionProvider>();
            });

            // Add framework services.
            services.AddApplicationInsightsTelemetry(Configuration);

            // Add the MVC service.
            services.AddMvc();
            var connection = @"Data Source=projector.database.windows.net;Initial Catalog=projector_db;User ID=projector;Password=PAss1234;MultipleActiveResultSets=true";
            // Connect to the database.
            services.AddDbContext<ProjectorContext>(options => options.UseSqlServer(connection));

            // Register the NpmRegistry and UserPackageManager services.
            services.AddTransient<INpmRegistry, NpmRegistry>();
            services.AddTransient<IUserPackageManager, UserPackageManager>();
            services.AddTransient<IUserFileManager, UserFileManager>();
            services.AddTransient<IUserWwwManager, UserWwwManager>();
        }

        // The secret key every token will be signed with.
        private static readonly string secretKey = "My favourite string is D5114238-A970-4D09-84F5-E99C9C795D58";

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            // Enable request logging in the console.
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            // And add debug-level logs support.
            loggerFactory.AddDebug();
            // Enable the use of response compression.
            app.UseResponseCompression();

            // If the current hosting enviroment is "Development".
            if (env.IsDevelopment())
            {
                // Enable the developer exception page.
                app.UseDeveloperExceptionPage();
                // And enable the Webpack Dev Middleware.
                app.UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions
                {
                    // We don't want the page to reload when any of the JS files changes.
                    HotModuleReplacement = false,
                    ReactHotModuleReplacement = false
                });
            }
            else
            {
                // If not in development, use the user-friendly Error Page.
                app.UseExceptionHandler("/Error");
            }

            // Enable the serving of static files from the /wwwroot directory.
            app.UseStaticFiles();

            // Add JWT generation endpoint.
            var signingKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secretKey));
            var options = new TokenProviderOptions
            {
                Path = "/api/auth",
                Audience = "CreoWebUser",
                Issuer = "CreoWebIss",
                Expiration = TimeSpan.FromHours(24),
                SigningCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256),
            };

            var tokenValidationParameters = new TokenValidationParameters
            {
                // The signing key must match!
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = signingKey,

                // Validate the JWT Issuer (iss) claim
                ValidateIssuer = true,
                ValidIssuer = "CreoWebIss",

                // Validate the JWT Audience (aud) claim
                ValidateAudience = true,
                ValidAudience = "CreoWebUser",

                // Validate the token expiry
                ValidateLifetime = true,

                // If you want to allow a certain amount of clock drift, set that here:
                ClockSkew = TimeSpan.Zero
            };

            // Enable the use of cookie authentication.
            app.UseCookieAuthentication(new CookieAuthenticationOptions
            {
                // Authenticate only when explicitly requested.
                AutomaticAuthenticate = true,
                // Don't handle automatic challenge.
                AutomaticChallenge = true,
                // The authentication scheme is cookie-based.
                AuthenticationScheme = "Cookie",
                // The name of the cookie.
                CookieName = "access_token",
                // The cookie is storing a JWT.
                TicketDataFormat = new JwtDataFormat(
                    SecurityAlgorithms.HmacSha256,
                    tokenValidationParameters),
                // The path of the login page.
                LoginPath="/Login",
                // If the access is denied, redirect to the Login page again.
                AccessDeniedPath = "/Login",
            });

            // Use the JWT authentication provider.
            app.UseMiddleware<TokenProviderMiddleware>(Options.Create(options));

            // Configure the MVC service.
            app.UseMvc(routes =>
            {
                // Give the ASP.NET routes priority.
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");

                // Allow api requests.
                routes.MapRoute("api", "api/{controller}/{action}");

                // If the request was an API request, fallback to the web app itself.
                routes.MapSpaFallbackRoute("spa-fallback", new
                {
                    controller = "Home",
                    action = "Index"
                });
            });

        }
    }
}
