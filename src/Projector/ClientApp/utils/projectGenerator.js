import * as IR from './irdom';
import JSZip from 'jszip';
import * as FileSaver from 'file-saver';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { kebabCase } from 'lodash';
import * as pacman from '~/api/pacman';
import { editorInterface } from '~/reducers/editor';
import { resourcesInterface, RESOURCE_TYPES, GLOBAL_GROUP } from '~/reducers/resources';
import { updateWebsiteAsync } from '~/api/hostman';
const jsBeautify = require('js-beautify').js_beautify;
const pd = require('pretty-data').pd;
let Babel = null;
if (typeof window !== 'undefined') {
  Babel = require('babel-standalone');
}

const GET_RESOURCES_CODE = "(self.__CW_RESOURCES__ || (self.__CW_RESOURCES__ = { '-key-': function(key) { return (this[key] || (this[key] = {})); } }))['-key-']";
const GET_COMPONENTS_CODE = "(self.__CW_COMPONENTS__ || (self.__CW_COMPONENTS__ = {}))";
const PAGE_ROOT_ID = "cw--page-root";

export default class ProjectGenerator {

  static async downloadProjectZipAsync(project, resources) {
    let zipBlob = null;
    try {
      zipBlob = await ProjectGenerator.generateProjectZipBlobAsync(project, resources);
    } catch (e) {
      alert("Your website's bundle could not be generated. Please, check for any possible errors and try again.");
      throw e;
    }
    FileSaver.saveAs(zipBlob, 'project.zip');
  }

  static async uploadProjectZipAsync(project, resources) {
    const zipBlob = await ProjectGenerator.generateProjectZipBlobAsync(project, resources);
    await updateWebsiteAsync(project.id, project.url, zipBlob);
  }

  static async downloadAndUploadProjectZipAsync(project, resources) {
    let zipBlob = null;
    try {
      zipBlob = await ProjectGenerator.generateProjectZipBlobAsync(project, resources);
    } catch (e) {
      alert("Your website's bundle could not be generated. Please, check for any possible errors and try again.");
      throw e;
    }

    try {
      await updateWebsiteAsync(project.id, project.url, zipBlob);
    } catch (e) {
      alert("An unexpected error occurred. Your website could not be updated. All changes made were undoed.");
      throw e;
    }

    FileSaver.saveAs(zipBlob, 'project.zip');
  }

  static async  generateProjectZipBlobAsync(project, resources) {
    const files = {};

    for (const component of project.components) {
      const componentFiles = FileStructureGenerator.generateComponentStructure(project.components, component, resourcesInterface(component.name, resources).records);
      for (const file in componentFiles) {
        if (Object.prototype.hasOwnProperty.call(componentFiles, file)) {
          files['components/' + kebabCase(component.name) + '/' + file] = componentFiles[file];
        }
      }
    }

    const packagesStructure = await FileStructureGenerator.generatePackagesStructure(project.name);
    for (const file in packagesStructure) {
      if (Object.prototype.hasOwnProperty.call(packagesStructure, file)) {
        files[file] = packagesStructure[file];
      }
    }

    const pages = project.components.filter(x => x.isPage);

    const globalResourceFiles = FileStructureGenerator.generateResourceStructure(resourcesInterface(null, resources).records, GLOBAL_GROUP);
    Object.assign(files, globalResourceFiles);

    for (const page of pages) {
      const editor = editorInterface(page);
      const html = '';
      const pageHTML = CodeGenerator.generatePageHTML({
        title: page.name,
        description: page.description,
        content: html,
        externalFiles: [
          'https://cdnjs.cloudflare.com/ajax/libs/react/15.4.2/react.min.js',
          'https://cdnjs.cloudflare.com/ajax/libs/react/15.4.2/react-dom.min.js',
          'https://cdnjs.cloudflare.com/ajax/libs/normalize/5.0.0/normalize.min.css'
        ].concat(Object.keys(files).filter(isLinkableFile)),
        inlineScript: `${spaces(8)}ReactDOM.render(React.createElement(${GET_COMPONENTS_CODE}.${page.name}), document.getElementById("${PAGE_ROOT_ID}"))`
      });
      files[kebabCase(page.name) + '.html'] = pageHTML;
      await waitNextTickAsync();
    }

    return await ProjectGenerator.structureToZipAsync(files);
  }

  static async structureToZipAsync(files) {
    var zip = new JSZip();

    for (let file in files) {
      if (Object.prototype.hasOwnProperty.call(files, file)) {
        const content = files[file];
        const ext = getFileExt(file);
        switch (ext) {
          case 'js':
          case 'html':
          case 'css':
            zip.file(file, content);
            break;
          case 'jpg':
          case 'png':
            zip.file(file, content, { base64: true });
            break;
        }
      }
    }

    return await zip.generateAsync({ type: 'blob' });
  }

}

function isJSFile(file) {
  return file.substr(file.length - 3) === '.js';
}

function isCSSFile(file) {
  return file.substr(file.length - 4) === '.css';
}

function isLinkableFile(file) {
  return isCSSFile(file) || isJSFile(file);
}

class ResourceProcessor {
  static processCSS(name, code) {
    return pd.css(code);
  }
  static processHTML(name, code) {
    return pd.xml(code);
  }
  static processText(name, code, groupName) {
    const html = JSON.stringify(code);
    return `${GET_RESOURCES_CODE}("${groupName}")["${name}"] = ${html};`;
  }
  static processJSON(name, code, groupName) {
    const pretty = JSON.stringify(JSON.parse(code));
    const js = `${GET_RESOURCES_CODE}("${groupName}")["${name}"] = ${pretty};`;
    return jsBeautify(js);
  }
  static processJS(name, code, groupName) {
    const es5 = Babel.transform(code, { presets: ['react', 'latest'] }).code;
    const js = `${GET_RESOURCES_CODE}("${groupName}")["${name}"] = (function(exports) {
      var require = self.__cwuser_require__;
      ${es5};
      return exports;
    }({}))`;
    return jsBeautify(js);
  }
}

class FileStructureGenerator {

  static async generatePackagesStructure(projectName) {
    try {
      const bundle = await pacman.getBundleAsync(projectName);
      return {
        'packages/bundle.js': bundle,
      };
    } catch (e) {
      console.error("User package bundle not included in project.", e);
      return {};
    }
  }

  static generateResourceStructure(resourceList, groupName) {
    const files = {};
    for (const id in resourceList) {
      if (Object.prototype.hasOwnProperty.call(resourceList, id)) {
        const resource = resourceList[id];
        switch (resource.type) {
          case RESOURCE_TYPES.CSS:
            files['styles/' + kebabCase(resource.name) + '.css'] = ResourceProcessor.processCSS(resource.name, resource.value, groupName);
            break;
          case RESOURCE_TYPES.JS:
            files['data/' + kebabCase(resource.name) + '.js'] = ResourceProcessor.processJS(resource.name, resource.value, groupName);
            break;
          case RESOURCE_TYPES.JSON:
            files['scripts/' + kebabCase(resource.name) + '.js'] = ResourceProcessor.processJSON(resource.name, resource.value, groupName);
            break;
          case RESOURCE_TYPES.TEXT:
            files['markup/' + kebabCase(resource.name) + '.js'] = ResourceProcessor.processText(resource.name, resource.value, groupName);
          default:
          // TODO
        }
      }
    }
    return files;
  }
  static generateComponentStructure(components, component, resourceList) {
    const files = {};
    const classCode = CodeGenerator.generateClassCode(components, component, resourceList);
    files['component.js'] = jsBeautify(`
      "use strict";
      ${GET_COMPONENTS_CODE}.${component.name} = ${classCode};
    `);

    const resourceStructure = FileStructureGenerator.generateResourceStructure(resourceList, component.name);
    for (const file in resourceStructure) {
      if (Object.prototype.hasOwnProperty.call(resourceStructure, file)) {
        files[file] = resourceStructure[file];
      }
    }

    return files;
  }
}

class CodeGenerator {
  static generateClassCode(components, component, resourceList) {
    const componentLinkCode = components
      .filter(x => x.name !== component.name)
      .map(x => `var ${x.name} = ${GET_COMPONENTS_CODE}.${x.name};`)
      .join('\n;');

    let defaultProps = IR.deserializeComponentDefaults(component.defaultProps);
    let initialState = IR.deserializeComponentDefaults(component.initialState);

    const es5 = IR.getNodeCreateCode(IR.getRootNode(component.nodes), component.nodes);
    const componentClassCode = IR.createComponentClassCode(es5, component.name, defaultProps, initialState, componentLinkCode);

    return componentClassCode;
  }

  static getPathPriority(path) {
    if (path.includes('components/')) {
      return 500;
    }
    if (path.includes('styles/')) {
      return 600;
    }
    if (path.includes('scripts/')) {
      return 700;
    }
    if (path.includes('data/')) {
      return 800;
    }
    if (path.includes('packages/')) {
      return 900;
    }
    if (path.includes('http://') || path.includes('https://')) {
      return 1000;
    }
    return 0;
  }

  static generatePageHTML({ title, description, content, externalFiles, inlineScript }) {
    const scripts = [];
    const styles = [];

    for (let file of externalFiles) {
      if (isJSFile(file)) {
        scripts.push(file);
      } else if (isCSSFile(file)) {
        styles.push(file);
      } else {
        console.log("File " + file + " not included in project archive.");
      }
    }

    const stylesCode = styles
      .map(file => `<link href=${file} rel="stylesheet">`)
      .join('\n        ');

    const scriptsCode = scripts
      .sort((a, b) => {
        return CodeGenerator.getPathPriority(b) - CodeGenerator.getPathPriority(a);
      })
      .map(file => `<script src=${file} type="text/javascript"></script>`)
      .join('\n        ');

    return (`
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="X-UA-Compatible" content="IE=Edge">
        <meta name="robots" content="index, follow">
        <title>${title}</title>
        ${stylesCode}
    </head>
    <body>
        <div id="${PAGE_ROOT_ID}">${content}</div>
        ${scriptsCode}
        <script type="text/javascript">
    ${inlineScript}
        </script>
    </body>
</html>
`).trim();
  }
}

async function waitNextTickAsync() {
  return new Promise(setImmediate);
}

function getFileExt(filename) {
  const extIndex = filename.lastIndexOf('.');
  if (extIndex === -1) {
    throw new Error("The file does not have an extension specified.");
  } else {
    return filename.substr(extIndex + 1);
  }
}

var _spaces = [];
function spaces(count) {
  if (count == 0) {
    return '';
  }
  if (_spaces[count]) {
    return _spaces[count];
  } else {
    return _spaces[count] = (new Array(count + 1)).join(' ');
  }
}

if (!String.prototype.includes) {
  String.prototype.includes = function (search, start) {
    'use strict';
    if (typeof start !== 'number') {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}