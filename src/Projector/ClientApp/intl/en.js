export default {

  LANGUAGE_MENU: {
    LABEL: "Language",
    LANGUAGES: {
      EN: "English",
      BG: "Bulgarian",
    },
  },

  HOME: {
    LOGIN_BUTTON: "Log in",
    SIGNUP_BUTTON: "Sign up",
    LOGOUT_BUTTON: "Log out",
    GO_TO_DASHBOARD_BUTTON: "Go To Dashboard",
    SHOWCASE_SUBTITLE: "Empowering the Future of the <b>Web</b>.",
    SHOWCASE_DESCRIPTION: "<b>CreoWeb</b> is a <b>modern</b> platform for designing and running <b>dynamic</b> websites that meet the <b>user's expectations.</b>",
    INFO_ROW: { 
      FIRST: {
        TITLE: "Simple",
        CONTENT: "Create dynamic websites using a simple user interface."
      },
      SECOND: {
        TITLE: "Powerful",
        CONTENT: "Do what you 💗 using powerful design tools.",
      },
      THIRD: {
        TITLE: "Modern",
        CONTENT: "Use the latest technology innovations to create your own stunning website.",
      },
    },
    SHOWCASE_NEXT_TITLE: "CreoWeb",
    SHOWCASE_NEXT_SUBTITLE: "Create <b>amazing dynamic websites</b> with a few mouse clicks.",
    SHOWCASE_NEXT_DESCRIPTION: "Start successfully with the large array of <b>Starter Projects</b> and more than <b><a href='https://www.npmjs.com/#pane-what-can-you-make' target='_blank'>400'000 ready-to-use packages</a></b>.",
  },

  EDITOR: {
    CONTENT_TAB: "Content",
    RESOURCES_TAB: "Resources",
    DETAILS_TAB: "Details",
    COMPONENTS_TAB: "Components",
    PREVIEW_TAB: "Design",
    CONSOLE_TAB: "Console",

    GREETER: {
      HEADER: "Did you know?..",
      SCREENS: {
        ADDING_CONTENT: {
          TITLE: "Adding New Content",
          CONTENT: "You can add a new component to an element by selecting it in the preview panel and clicking the plus icon on any component in the components panel.",
        },
        CHANGING_STYLES: {
          TITLE: "Changing Element Styles",
          CONTENT: "Adding new style rules to an element is very easy. Try selecting it in the preview panel, then go to the properties panel and add a \"style\" property (if missing). Mark the property as of type \"dictionary\" and try someting like setting \"background\" (add if missing) to \"peachpuff\"."
        }
      },
    },

    PANEL_DISABLED_NOTIFICATION: "Panel is disabled while testing.",

    TOOLBAR: {
      PLAY_TOOLTIP: "Play",
      PAUSE_TOOLTIP: "Pause",
      DOWNLOAD_TOOLTIP: "Save",
      SETTINGS_TOOLTIP: "Settings",
    },

    LAYOUTS_MENU: {
      LABEL: "Layout",
      LAYOUTS: {
        COMPACT: "Compact",
        WIDE: "Wide",
      },
    },

    SETTINGS_DIALOG: {
      DIALOG_TITLE: "Settings",
      CANCEL_BUTTON: "Cancel",
      APPLY_BUTTON: "Apply",
      COMPONENT_PROPS_TITLE: "Component Props",
      PROPS_EXPLAIN: "Those are props that your component is going to need when using it as a prefab in other places.",
      COMPONENT_SETTINGS_TITLE: "Component Settings",
      EDITOR_SETTINGS_TITLE: "Editor Settings",
      PROPS_TABLE: {
        NAME_HEADER: "Name",
        TYPE_HEADER: "Type",
        DEFAULT_VALUE_HEADER: "Default Value",
        REQUIRED_HEADER: "Required",
        ACTIONS_HEADER: "Actions",
      },
      COMPONENT_STATE_TITLE: "Component State",
      STATE_EXPLAIN: "Those are state variables that your component is using.",
    },

    SAVE_DIALOG: {
      DIALOG_TITLE: "Save Project",
      CANCEL_BUTTON: "Cancel",
      SAVE_BUTTON: "Save",
    },

    EXTERNAL_COMP_DIALOG: {
      CANCEL_BUTTON: "Cancel",
      CREATE_BUTTON: "Create",
      TITLE: "Connect an External Component",
      SELECTOR_LABEL: "Selector",
      DEFAULT_EXPORT_HINT: "<use default export>",
    },

    PANELS: {
      COMPONENT_LIST: {
        VIEW_REFERENCE_TOOLTIP: 'View Reference',
        ADD_TO_SELECTION_TOOLTIP: 'Add to Selection',
        OPEN_IN_EDITOR_TOOLTIP: 'Open in the Editor',
        SEARCH_HINT: "Search",
        NAME_HEADER: "Name",
        ACTIONS_HEADER: "Actions",
        HTML_NAV_ITEM: "HTML",
        USER_NAV_ITEM: "User",
        EXTERNAL_NAV_ITEM: "External"
      },

      RES_VIEWER: {
        LOCAL_LABEL: "Local",
        GLOBAL_LABEL: "Global",
        EXTERNAL_LABEL: "Packages",
        FILES_LABEL: "Files",
        NAME_HEADER: "Name",
        VERSION_HEADER: "Version",
        ACTIONS_HEADER: "Actions",
        DATA_TYPE_HEADER: "Data Type",
        VIEW_REFERENCE_TOOLTIP: "View Reference",
        EDITING_HEADER: "Resource Editor",
        RES_NAME_HINT: "Resource Name",
        PKG_NAME_HINT: "Package Name",
      },

      NODE_CHILDREN: {
        HOW_TO: {
          LABEL: "Help",
          TITLE: "How to use the Content panel?",
          CONTENT: "The Content panel shows the content of the currently selected element and the content of all of its parent elements. With the Content panel you can reorder, duplicate, change and remove the content of any element."
        },
        CONTENT_OF_PREFIX: "Content of",
      },
      
    }

  },

  DASHBOARD: {
    SITES: {
      LIST_EMPTY: "You don't have any sites.",
    },
  },

  LOGIN: {
    LOGIN_HEADER: "Login",
    LOGIN_BUTTON: "Log in",
    EMAIL_LABEL: "Email",
    PASSWORD_LABEL: "Password",
    REMEMBER_ME: "Remember me"
  },

  SIGNUP: {
    SIGNUP_HEADER: "Signup",
    SIGNUP_SUCCESS: "You have signed up successfully!",

    PERSONAL_INFORMATION_HEADER: "Personal Information",
    CREDENTIALS_HEADER: "Credentials",
    CREATE_PASSWORD_HEADER: "Create a Password",

    SIGNUP_BUTTON: "Sign in",
    FIRST_NAME_LABEL: "First name",
    LAST_NAME_LABEL: "Last name",
    USERNAME_LABEL: "Username",
    EMAIL_LABEL: "Email",
    PASSWORD_LABEL: "Password",
    CONFIRM_PASSWORD_LABEL: "Confirm your password",
    BIRTH_DATE_LABEL: "Birth Date",

    USERNAME_EXISTS: "This username already exist.",
    EMAIL_EXISTS: "This email already exist.",
    PASSWORDS_DONT_MATCH: "These passwords don't match.",

    START_CREATING_BUTTON: "Start Creating",

    I_AGREE_TERMS: "I agree to the <a href=\"/Policies/TermsOfUse\" target=\"_blank\">Terms of Service</a>.",

    NEXT_BUTTON: "Next",
    FINISH_BUTTON: "Finish",
    BACK_BUTTON: "Back",
  },

  HELP_DIALOG: {
    TITLE: 'Help',
    CLOSE_BUTTON: 'Close'
  },

  TERMS_OF_USE: require('./blocks/terms-en').default,

  VALIDATE: {
    EMAIL_EMPTY: "The email field cannot be empty.",
    EMAIL_INVALID: "Please, enter a valid email address.",

    PASSWORD_EMPTY: "The password field cannot be empty.",
    PASSWORD_TOO_SHORT: "The password must be at least 8 characters in length.",
    PASSWORD_TOO_LONG: "The password must be at most 16 characters in length.",
    PASSWORD_INVALID: "The password must contain at least 1 uppercase and 1 lowercase letter and a number.",

    FIRST_NAME_EMPTY: "First name cannot be empty.",
    FIRST_NAME_BEGIN_SPACE: "First name cannot begin with a space.",
    FIRST_NAME_END_SPACE: "First name cannot end with a space.",
    FIRST_NAME_MULTIPLE_SPACES: "First name cannot contain multiple subsequent spaces.",
    FIRST_NAME_TOO_LONG: "First name cannot be more than 50 characters in length.",

    LAST_NAME_EMPTY: "Last name cannot be empty.",
    LAST_NAME_BEGIN_SPACE: "Last name cannot begin with a space.",
    LAST_NAME_END_SPACE: "Last name cannot end with a space.",
    LAST_NAME_MULTIPLE_SPACES: "Last name cannot contain multiple subsequent spaces.",
    LAST_NAME_TOO_LONG: "Last name cannot be more than 50 characters in length.",

    USERNAME_EMPTY: "Username cannot be empty.",
    USERNAME_TOO_SHORT: "Username must be at least 8 characters in length.",
    USERNAME_TOO_LONG: "Username cannot be more that 25 characters in length.",
    USERNAME_INVALID: "Username can only be an alphanumeric sequence and may also contain \"-\", \"_\" or \".\".",

  }

};