import PageBase from './PageBase';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import { Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import TextField from 'material-ui/TextField';
import { connect } from 'react-redux';
import DatePicker from 'material-ui/DatePicker';
import { blue500 } from 'material-ui/styles/colors';
import { Tabs, Tab } from 'material-ui/Tabs';
import Slider from 'material-ui/Slider';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import Menu from 'material-ui/Menu';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ImageEdit from 'material-ui/svg-icons/image/edit';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { Step, Stepper, StepLabel, StepContent } from 'material-ui/Stepper';
import Avatar from 'material-ui/Avatar';
import Chart from '~/components/Chart';
import { getSites } from '~/api/sites';
import { addSiteToDB } from '~/api/sites';
import Delete from 'material-ui/svg-icons/action/delete';
import { deleteSite } from '~/api/sites';
import CircularProgress from 'material-ui/CircularProgress';
import DeviceStorage from 'material-ui/svg-icons/device/storage';
import AVWeb from 'material-ui/svg-icons/av/web';
import Toggle from 'material-ui/Toggle';
import IconButton from 'material-ui/IconButton';
import ActionCode from 'material-ui/svg-icons/action/code';
import { addComponentToDB } from '~/api/sites';
import { deleteComponent } from '~/api/sites';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import Checkbox from 'material-ui/Checkbox';
import ActionSettings from 'material-ui/svg-icons/action/settings';
import { Link } from 'react-router';
import { editSite } from '~/api/sites';
import { projectInterface } from '~/reducers/project';
import Translate from '~/components/Translate';
import SaveDialog from '~/components/pages/EditorPage/dialogs/SaveDialog';
import FileDownload from 'material-ui/svg-icons/file/file-download';
import { maskDatabaseId, unmaskDatabaseId } from '~/utils/requests.js';
import { isCollaboratorExists } from '~/api/sites';
import SelectField from 'material-ui/SelectField';
typeof window !== 'undefined'
  && require('~/styles/dashboard-page.scss');

export class DashboardPage extends PageBase {
  constructor(props) {
    super(props, { title: 'Dashboard', isImmersive: false, authenticate: true });
    this.state = {
      uac: 0, collaboratorError: "", collaborator: "", tableData: [{ id: -1, email: props.auth.user.email, name: props.auth.user.firstName + " " + props.auth.user.lastName, uac: 2 }], selectedChart: 0, pageDescription: '', downloadOpen: false, agreement: false, open6: false, isPublic: false, storage2: 0, description2: '', favicon2: '', siteName2: '', open5: false, loading4: false, deletedComponent: 0, isPage2: true, open4: false, loading3: false, isPage: true, pageName: "MyPage", open3: false, pages: [], url: "", isHosted: false, storage: 1, loading2: false, loading: true, open2: false, stepIndex: 0, description: "", selectedSite: 0,
      favicon: "data:image/png;base64,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"
      , siteName: "", open: false, sites: []
    };

    this.addSite = this.addSite.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.siteNameChange = this.siteNameChange.bind(this);
    this.faviconChange = this.faviconChange.bind(this);
    this.descriptionChange = this.descriptionChange.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handlePrev = this.handlePrev.bind(this);
    this.handle2Open = this.handle2Open.bind(this);
    this.handle2Close = this.handle2Close.bind(this);
    this.delSite = this.delSite.bind(this);
    this.handleSlider = this.handleSlider.bind(this);
    this.toggleClick = this.toggleClick.bind(this);
    this.getPages = this.getPages.bind(this);
    this.getComponents = this.getComponents.bind(this);
    this.addPage = this.addPage.bind(this);
    this.handle3Open = this.handle3Open.bind(this);
    this.handle3Close = this.handle3Close.bind(this);
    this.pageNameChange = this.pageNameChange.bind(this);
    this.handle4Open = this.handle4Open.bind(this);
    this.handle4Close = this.handle4Close.bind(this);
    this.delComponent = this.delComponent.bind(this);
    this.urlChange = this.urlChange.bind(this);
    this.handle2Slider = this.handle2Slider.bind(this);
    this.description2Change = this.description2Change.bind(this);
    this.favicon2Change = this.favicon2Change.bind(this);
    this.siteName2Change = this.siteName2Change.bind(this);
    this.handle5Open = this.handle5Open.bind(this);
    this.handle5Close = this.handle5Close.bind(this);
    this.handle6Open = this.handle6Open.bind(this);
    this.handle6Close = this.handle6Close.bind(this);
    this.saveChanges = this.saveChanges.bind(this);
    this.isPublicChange = this.isPublicChange.bind(this);
    this.agreementChange = this.agreementChange.bind(this);
    this.isPublicTrue = this.isPublicTrue.bind(this);
    this.handleComponentEdit = this.handleComponentEdit.bind(this);
    this.pageDescriptionChange = this.pageDescriptionChange.bind(this);
    this.listCharts = this.listCharts.bind(this);
    this.getCharts = this.getCharts.bind(this);
    this.getCharts = this.getCharts.bind(this);
    this.handleDownload = this.handleDownload.bind(this);
    this.collaboratorChange = this.collaboratorChange.bind(this);
    this.addCollaborator = this.addCollaborator.bind(this);
    this.uacChange = this.uacChange.bind(this);
    this.listItems = [];
  }
  getTable(data) {
    return (
      <Table
        fixedHeader={true}
        selectable={false}
      >
        <TableHeader
          displaySelectAll={false}
        >
          <TableRow>
            <TableHeaderColumn tooltip="Name">Name</TableHeaderColumn>
            <TableHeaderColumn tooltip="Email">Email</TableHeaderColumn>
            <TableHeaderColumn tooltip="Access Level">Access Level</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody
          displayRowCheckbox={false}
          showRowHover={true}
        >
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableRowColumn>{row.name}</TableRowColumn>
              <TableRowColumn>{row.email}</TableRowColumn>
              <TableRowColumn>{this.getAccessText(row.uac)}</TableRowColumn>
            </TableRow>
          ))}
        </TableBody>
      </Table>);
  }
  getAccessText(uac) {
    switch (uac) {
      case 0:
        return ("Contributor");
      case 1:
        return ("Admin");
      case 2:
        return ("Owner");
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }
  uacChange(event, index, value) {
    this.setState({ uac: value });
  }
  async addCollaborator() {
    var exists = false;
    for (var item of this.state.tableData) {
      if (item.email === this.state.collaborator) exists = true;
    }
    if (!exists) {
      var obj = await isCollaboratorExists(this.state.collaborator);
      if (obj.exists) {
        var td = this.state.tableData;
        td.push({ id: obj.user.id, email: obj.user.email, name: obj.user.firstName + " " + obj.user.lastName, uac: this.state.uac });
        this.setState({ tableData: td });
        this.setState({ collaboratorError: "" });
        this.setState({ collaborator: "" });
        this.setState({ uac: 0 });
      }
      else {
        this.setState({ collaboratorError: "This email does not exist" });
      }
    }
    else {
      this.setState({ collaboratorError: "This email is already added" });
    }

  }
  collaboratorChange(event) {
    this.setState({ collaboratorError: "" });
    this.setState({ collaborator: event.target.value });
  }
  getCharts() {
    var sites = this.state.sites;
    if (!sites) return;
    sites = sites.slice();
    var sitesStorage = [];
    var storage = 0;
    for (var site of sites) {
      storage += site.storage * 1024;
      sitesStorage.push({ storage: site.storage * 1024, name: site.siteName });
      var pagesSize = [];
      var pages = this.state.pages[sites.indexOf(site)];
      if (!pages) return sites;
      for (var page of pages) {
        var n = {};
        n.size = page.size;
        n.name = page.name;
        pagesSize.push(n);
      }
      site.pagesSize = pagesSize;
    }
    sites.unshift({ siteName: "Main Storage", storage: 32, size: storage, pagesSize: sitesStorage });
    return sites;
  }

  pageDescriptionChange(event) {
    this.setState({ pageDescription: event.target.value });
  }
  isPublicTrue(event) {
    this.setState({ isPublic: true });
    this.handle6Close();
  }
  agreementChange(event, isInputChecked) {
    this.setState({ agreement: isInputChecked });
  }
  handle6Open(event) {
    this.setState({ open6: true });
  }
  handle6Close(event) {
    this.setState({ open6: false });
  }
  handleDownload() {
    this.setState({ downloadOpen: !this.state.downloadOpen });
  }
  isPublicChange(event, isInputChecked) {
    if (isInputChecked) {
      this.handle6Open();
    }
    else {
      this.setState({ isPublic: false });
    }
  }
  async saveChanges(event) {
    this.setState({ loading4: true });
    var sites = this.state.sites;
    var n = sites[this.state.selectedSite];
    n.siteName = this.state.siteName2;
    n.favicon = this.state.favicon2;
    n.description = this.state.description2;
    n.storage = this.state.storage2;
    n.isPublic = this.state.isPublic;
    n.size = await editSite(n).size;
    sites[this.state.selectedSite] = n;
    this.setState({ sites: sites });
    this.setState({ loading4: false });
    this.handle5Close();
  }
  handle2Slider(event, value) {
    this.setState({ storage2: value });
  }
  description2Change(event) {
    this.setState({ description2: event.target.value });
  }
  favicon2Change(event) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e) {
        this.setState({ favicon2: e.target.result });
      }
      reader.onload = reader.onload.bind(this);
      reader.readAsDataURL(event.target.files[0]);
    }
  }
  siteName2Change(event) {
    this.setState({ siteName2: event.target.value });
  }
  handle5Open(event) {
    this.setState({ siteName2: this.state.sites[this.state.selectedSite].siteName });
    this.setState({ favicon2: this.state.sites[this.state.selectedSite].favicon });
    this.setState({ description2: this.state.sites[this.state.selectedSite].description });
    this.setState({ storage2: this.state.sites[this.state.selectedSite].storage });
    this.setState({ isPublic: this.state.sites[this.state.selectedSite].isPublic });
    this.setState({ open5: true });
  }
  handle5Close(event) {
    if (this.state.loading4) return;
    this.setState({ open5: false });
  }
  handle3Open(isPage) {
    this.setState({ open3: true });
    this.setState({ isPage: isPage });
  }
  handle4Open(isPage, id) {
    this.setState({ open4: true });
    this.setState({ isPage2: isPage });
    this.setState({ deletedComponent: id });
  }
  handle4Close(event) {
    this.setState({ open4: false });
  }
  pageNameChange(event) {
    this.setState({ pageName: this.makeValidComponentName(event.target.value) });
  }
  handle3Close(event) {
    if (this.state.loading3) return;
    this.setState({ open3: false });
    this.setState({ pageName: 'MyPage' });
    this.setState({ pageDescription: '' });
  }
  async addPage(event) {
    this.setState({ loading3: true });
    var n = {};
    n.siteID = this.state.sites[this.state.selectedSite].id;
    n.componentText = '{}';
    n.isPage = this.state.isPage;
    n.name = this.state.pageName;
    n.screenshot = "bblarblar";
    n.isPrefab = false;
    n.description = this.state.pageDescription;
    if (this.state.pages.length > 0) var pages = this.state.pages;
    else var pages = [];
    var obj = await addComponentToDB(n);
    n.id = obj.id;
    n.size = obj.size;
    pages[this.state.selectedSite].push(n);
    this.setState({ pages: pages });
    this.setState({ loading3: false });
    this.handle3Close();
  }
  async addSite(event) {
    this.setState({ loading2: true });
    var n = {};
    var td = this.state.tableData;
    td.shift();
    n.collaborators = [];
    for (var data of td) {
      var nc = {};
      nc.email = data.email;
      nc.level = data.uac;
      n.collaborator.push(nc);
    }
    n.siteName = this.state.siteName;
    if (this.state.favicon.length < 46600)
      n.favicon = this.state.favicon;
    else
      n.favicon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTM0A1t6AAAKIklEQVRYR9VXeVDTZxpm263buvVCEJArQIBwJNxX7hASIOFGQW4BRVBQEESB1YAQICAIAoUICJZDBRQth7VrtVXa9axtp7WXSw+3bseubbfnbLU++/4wHaeztms7+88+M88wk0m+53nf7/ne78Po/wqNJ57+o6g2RhmyS12u6BT1hnVKDqv16hFxfWK7jaysYLm4wMvISPOI4ev/OyjrUj2k1Wl9cX1JX645HYuEqVCoRgVQjNlh5VElQqorwYnrgVNkO3gZ2z5IHo6uSRlYa2H4+W8HNzlvSXSfsj/lpPfd7HMByLnsg7VXfFDwuhhZz6dC1V2C2OeckHOOD7+CDvht1JGR3ZDVJkG1n/eNuku9XX9J/5hhuV8HXlaaV8R+wWzqGS7S/uKO7PMSxB/YhuSpUuRdTEfuxRTIG4eQccEXqw4XwivvEJTNxeCsaoZTtBaBpYkI1sVA3up3NqMvw9yw7MPBXpEvCNcrP084xUHiDAdJ512wYnwr5A1TKJgVIe+tJMQdHISg8jLUe8cgaxiHT+Gz8MgZgWvyXrgkaSGpXgG31evhsWMZhI2ct1MGUh5uS+zkG5zEmtTPVpx0QcwpNuJmiOfZSHlVisy3Q5D1ERe5n3ih8JMohO27CtnudyHUvoKAihfhvWkC3KwBcBI7EFCaB/+yFLiXLwVvpzGCOzxfkWRkPG6QeTBcV66c55W94dW4426IPGEP9UkW1GdsEXmRhdg37JE4y0bWTR7yb2ai8HMpQg+chnjXe+DXXIF/xVn4FE3DI/cQ3DL2wTmhDU5xOvhpvOFX4wRZaxBtT26jQerBsJFs2aLqiUTktAPCpm2heM4KIS8sh/LCckS8ZYWYv7KQ+bcgpF4aRMKpa0g9cx7Kp79GcOcNiBqvIlDzMnyKj5OJg3BL7yHqIGphI7AsBg5hO8AK3v6DraTE0yD3U5hK1j/psbr4VtQxF4RPsBAyaQXpcXNITplCMmMCxSVzJL6ZjpTLHyD9jVkkngdWzADRJ0BH8jbkPTcharqKAM0MvIsmwMsZhFtaF8TNUkh1kZA3RUBYkQpJWe6UQfKnsBSWrPXM2o7IcQ4UR2wgO7YcoollCJo0ht+xRYg/X0yid5D+HpD1d+InQPossOoKEHsKCB/9HsF7P4ZAR9tR/jw8C8bgnrkPLsmtEJSvReQwB+qDjog5zEVKT5azQfY+rKVlf/bILoXyEAvyEWtIRi0gHDdF4CFTxJ3ajZVnv0X6u0DuV8DGu0ABcd03QMZHQMJlIOpZQDn0BSR73kHgzpfgXfwMuDkDcEnpRHCzEvJeW8h6bRA6TNnSh5YaZO/B1XXlPBvptu+8czZDMcyCojcU8rZyKAfJ+fQaRBy+i4RzVPUNEv4B2AJgM3EDmcj6DEh+m7rwInVh7DvIut4Hv+4CfLdRFtYfoC7oIW7yQ2CrOQLbzSDusYSyM3DaIH0PZoI1brayP8E3rxBhhxzhX1oPr4JJiKov0aTTQH2EDFwAMqn1G8hAEYkXEtcTs74kA9eAuJcoC+O0DT3XIWi4DL/y5+CZfwh+xRoE6CzAq1sCrm4xAjqWQdnjecMgfQ8W/AIlJRSe2ZuhHnWD36Z2CGva6IyPQz00A9XYHawgAWbPc74mYao8j8TX3KbP/kE5YDpAgQwf/xcZ+AiCRjJQQQYKRshAJfy15uBWLYZ77SIE6c0g63G6+5MRbc3fFMUYcAivgVibhuijHghp1YBfdRoxz5Qgfvo1xJ7+AqteI8HrVPUX1A3KQvotIOlDOg2vUgYoiKGjX0Gmn6UgXqAOnIBH/gF45TdDpGPBp8YU/ruXQdZvhbB+dxQ1FT1hkKcOCDYqWLQF9qE74RTTRPM7BbFHZRDVjkCoex2KvmtYfWEIcbTPiSSWTGFMom4k0t94MhV9lto/eRshgzchab+KIO1L8N06QRkYgse6DgTvcoKgzhKKfSxEDLMR2e/9w8jIyKMGeSMjc/91rrbSCtgpq8CO1NEsb4NqbxbEtV0IrHwZ4tZ3odh/C6qjtxF9ktpN2xFHoYx5mSp/gcSn7kB58HPIumchbKKxrHkeXkVj4OUO0H3QTccwE8p2B8QPuyOkNh8RLRnXDdL34OOT85iNZOu3diEaOKhr4RzfAp+CJqw4kA35bj3UAy0IHziCiJFLUB2+DtWx76GevAPVxPcIO/INnZxPaV/fh6j1NaqeRvLWZ+C58SC4a/vhSsOImQXSqmLwtzDvhg6ENa45bpC+Dxtx6QmWfAfsw6rhGN1Ic7sDvHV6qJ5ORuJpd0Qf5yDquAuiJoUIPzCNkP03IO//GMG9H0LS+Q6Eu6+Q+Ax8yyap+lHw8gbhntVLc+ApGsm9dEv2gBPfBcfIPbCVl2w2yN6HlaAom8kBsw0OEXVwim+eG6XqIQkdQza1mAXZoDWEvTQhu+0o7SkI7hqcazm//hwCKLC+2ybgtXkMHhuGqfo+uKZ30cXUC7fUXnBWdtE7oQ32ito7y0V51gbZ+7DwyZlvI972KbMNTBfYUTr4by6FisanfD8L4m4rBOwxh88uE3jUGcOz3hj8Vge6CY9Q1VPwLhmHV+GIQbyfhPfCfTWJp1EXEkk8pg2O6mbYSMoPGyT/E9bCwqK5Ligq4aDSgpddjrABR4i7rOcmmZfWBG6aRXAuf3KO3Kol8KtzJhPr6SasQEB5DbjrqGoKnnsmI95N4k/BKXYP2BFNsAupvm0VuIFrkHsAJJrfUxYuMjPBnjkRFMigimTaY2v4N5mBqzGG89YFsC+cT3wCnLIF9NkS+O8yg7CDRux+B0i1+VR5D1xT9OAktFPlLbROIx3xOtiISuoNSj8Pq8D1bBvJtltzgSQTjpFaSFsC7nWgbilcyheCXcwYmD9ngFdFt2WDGSR6a4S0RVDrO+ZeRM7xrXCMaqJO6mgdLbV+6xk2u+APBplfho1wo4+tpOwzxoSdcidcEqrIhAxBnebwbl4Kt6pFcKlYCPfKxfBtNAV/jwXkfbbgl22i8LbQKWqiljfQI6SWQlcNCvibC01d2bQ08yT73ZzIf4OVuIhrKy2/ZkcLMFVw4um53e0Bvt4cfq2m8G4wge8uEm+1hKzDC8q9/mRUS+2upxBrqepqsOQaWPitPffoE4ujackgoiPxSeLDmVjAkS+1DMzrs5NX3nEIq4e8yxcivRUEncvBb7eAqMMGfE0EnCK0cFTVkOhOCnAV7IJ3wFpc+qWxs6qdlokiRhDDiYyJZcSH/u+JmdcmCyw9VVTJqGC7+p8hPS6Qd9tD2hwEXvpGSraGKp1774G50i0Fmz42cY/rf+TxhQn0WxUxlCgn/voOGMCYYH5kZjRvnrOlrySVHatusPRfc9DCP2eKjE2Ze2cOmbjG6uab89LoeyIin+hPZB6gLkRb4lLiw2fgAWDaxtzhzCKMoUVEY6IpkWnrjzQhLiEuJM4nMslnivjNwj8HZsFf4kPAyOjfzQbaVlWapK4AAAAASUVORK5CYII=';
    n.description = this.state.description;
    n.storage = this.state.storage;
    n.isHosted = this.state.isHosted;
    if (n.isHosted) n.url = this.state.url;
    else n.url = '';
    n.isPublic = false;
    if (this.state.sites.length > 0) var sites = this.state.sites;
    else var sites = [];
    if (this.state.pages.length > 0) var pages = this.state.pages;
    else var pages = [];
    var obj = await addSiteToDB(n);
    n.id = obj.id;
    n.size = obj.size;
    sites.push(n);
    pages[sites.length - 1] = [];
    pages[sites.length - 1].push(obj.main);
    this.setState({ sites: sites });
    this.setState({ pages: pages });
    this.listItems = sites.map((s, i) => <MenuItem onClick={e => this.setState({ selectedSite: i })} leftIcon={<img src={s.favicon} />} primaryText={s.siteName} />);
    this.setState({ loading2: false });
    this.handleClose();
  }
  handle2Open(event) {
    this.setState({ open2: true });
  }
  async handleComponentEdit(page) {
    const project = projectInterface(this.props.project, this.props.dispatch);
    const projectInfo = this.state.sites[this.state.selectedSite];
    const componentsInfo = this.state.pages[this.state.selectedSite];
    const sites = this.state.sites;
    this.setState({ loading: true, sites: [] });
    try {
      await project.load(projectInfo, componentsInfo, page.id);
      this.context.router.push({ pathname: '/Editor', /* query: { Proj: maskDatabaseId(projectInfo.id), Comp: maskDatabaseId(page.id) } */ });
    } catch (e) {
      this.setState({ loading: false, sites: sites });
      console.error("An error occurred while loading the project!", e);
    }
  }
  getPages(event) {
    var pages = this.state.pages[this.state.selectedSite];
    if (!pages) return <p className="no-pages-text">You don't have any pages.</p>;
    var pageList = pages.map((p, i) => p.isPage ? p.siteID === this.state.sites[this.state.selectedSite].id ?
      <Card className="page-card" >
        <CardHeader avatar={<AVWeb className="site-img icon-color" />} title={p.name} titleStyle={{ fontSize: '2em' }} />
        <CardText>{p.description}</CardText>
        <FloatingActionButton onClick={() => this.handleComponentEdit(p)} className="editor-btn" mini={true} primary={true} zDepth={2}>
          <ImageEdit />
        </FloatingActionButton >
        <IconButton onClick={e => this.handle4Open(true, i)} className="del2-btn" zDepth={2}>
          <Delete className="icon-color" />
        </IconButton >
      </Card> : '' : '');
    if (pageList.toString().replace(',', '') === '') pageList = <p className="no-pages-text">You don't have any pages.</p>
    return pageList;
  }
  getComponents(event) {
    var components = this.state.pages[this.state.selectedSite];
    if (!components) return <p className="no-pages-text">You don't have any components.</p>;
    var componentList = components.map((p, i) => !p.isPage ? p.siteID === this.state.sites[this.state.selectedSite].id ? <Card className="component-card" >
      <CardHeader avatar={<ActionCode className="site-img icon-color" />} title={p.name} titleStyle={{ fontSize: '2em' }} />
      <CardText>{p.description}</CardText>
      <FloatingActionButton onClick={() => this.handleComponentEdit(p)} className="editor-btn" mini={true} primary={true} zDepth={2}>
        <ImageEdit />
      </FloatingActionButton >
      <IconButton onClick={e => this.handle4Open(false, i)} className="del2-btn" zDepth={2}>
        <Delete className="icon-color" />
      </IconButton >
    </Card> : '' : '');
    if (componentList.toString().replace(',', '') === '') componentList = <p className="no-pages-text">You don't have any components.</p>
    return componentList;
  }
  handle2Close(event) {
    this.setState({ open2: false });
  }
  handleSlider(event, value) {
    this.setState({ storage: value });
  }
  urlChange(event) {
    const hostname = event.target.value;
    const hostnameRegex = /^\w+$/;
    const test = hostnameRegex.test.bind(hostnameRegex);
    this.setState({ url: hostname.split('').filter(test).join('') });
  }
  delSite(id) {
    deleteSite(id);
    var sites = this.state.sites;
    sites.splice(this.state.selectedSite, 1);
    this.setState({ sites: sites });
    this.setState({ selectedSite: 0 });
    this.handle2Close();
    this.listItems = sites.map((s, i) => <MenuItem onClick={e => this.setState({ selectedSite: i })} leftIcon={<img src={s.favicon} />} primaryText={s.siteName} />);
  }
  delComponent() {
    deleteComponent(this.state.pages[this.state.selectedSite][this.state.deletedComponent].id);
    var pages = this.state.pages;
    pages[this.state.selectedSite].splice(this.state.deletedComponent, 1);
    this.setState({ pages: pages });
    this.handle4Close();
  }
  listCharts() {
    var sites = this.state.sites;
    var listCharts = sites.map((s, i) => i == 0 ? <div><MenuItem onClick={e => this.setState({ selectedChart: 0 })} leftIcon={<DeviceStorage />} primaryText="Main Storage" /> <MenuItem onClick={e => this.setState({ selectedChart: i + 1 })} leftIcon={<img src={s.favicon} />} primaryText={s.siteName} /></div> : <MenuItem onClick={e => this.setState({ selectedChart: i + 1 })} leftIcon={<img src={s.favicon} />} primaryText={s.siteName} />);
    return listCharts;
  }
  async componentDidMount() {
    super.componentDidMount();
    var blar = await getSites();
    this.setState({ sites: blar.sites });
    this.setState({ pages: blar.pages });
    this.setState({ loading: false });
  }

  handleOpen(event) {
    this.setState({ open: true });
  }
  makeValidComponentName(name) {
    const charRegex = /[a-z]/i;
    const chars = [];
    for (let i = 0; i < name.length; i++) {
      const char = name.charAt(i);
      if (char.match(charRegex)) {
        chars.push(char);
      }
    }
    const validName = chars.join('');
    return validName;
  }
  siteNameChange(event) {
    this.setState({ siteName: event.target.value });
  }
  handleClose(event) {
    if (this.state.loading2) return;
    this.setState({ open: false });
    this.setState({ siteName: '' });
    this.setState({ favicon: 'data:image/png;base64,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' });
    this.setState({ description: '' });
    this.setState({ stepIndex: 0 });
    this.setState({ storage: 1 });
    this.setState({ isHosted: false });
    this.setState({ url: '' });
    this.setState({ uac: 1 });
    this.setState({ collaborator: '' });
    this.setState({ collaboratorError: '' });
    this.setState({ tableData: [{ id: -1, email: this.props.auth.user.email, name: props.auth.user.firstName + " " + this.props.auth.user.lastName, uac: 2 }] })
  }
  handleNext(event) {
    this.setState({ stepIndex: this.state.stepIndex + 1 });
  }
  handlePrev(event) {
    this.setState({ stepIndex: this.state.stepIndex - 1 });
  }
  descriptionChange(event) {
    this.setState({ description: event.target.value });
  }
  faviconChange(event) {

    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e) {
        this.setState({ favicon: e.target.result });
      }
      reader.onload = reader.onload.bind(this);
      reader.readAsDataURL(event.target.files[0]);
    }
  }
  toggleClick(event, toggled) {
    this.setState({ isHosted: toggled });
  }
  getStepActions(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (<div className="btn-div">
          <RaisedButton label="Next" primary={true} onTouchTap={this.handleNext} />
          <FlatButton label="Cancel" primary={true} onTouchTap={this.handleClose} />
        </div>);
      case 1:
        return (<div className="btn-div">
          <RaisedButton label="Next" primary={true} onTouchTap={this.handleNext} />
          <FlatButton label="Back" primary={true} onTouchTap={this.handlePrev} />
        </div>);
      case 2:
        return (<div className="btn-div">
          <RaisedButton disabled={this.state.loading2 || (this.state.isHosted && this.state.url.length == 0)} label="Create" primary={true} onTouchTap={this.addSite} />
          <FlatButton disabled={this.state.loading2} label="Back" primary={true} onTouchTap={this.handlePrev} />
        </div>);
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }
  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (<div>
          <TextField
            hintText="Site Name"
            floatingLabelText="Site Name"
            value={this.state.siteName}
            onChange={this.siteNameChange} />
          <br />
          <div>
            Favicon:<img className="fav-img" src={this.state.favicon} />
            <FlatButton label="Choose an Image" labelPosition="before">
              <input onChange={this.faviconChange} className="fav-input" type="file" />
            </FlatButton>
          </div>
          <TextField hintText="Description" floatingLabelText="Description" className="description-input" value={this.state.description} onChange={this.descriptionChange} multiLine={true} rows={1} rowsMax={4} />
          <br />
          Storage:{this.state.storage}
          <Slider style={{ width: 300 }} onChange={this.handleSlider} min={1} value={this.state.storage} step={1} max={32} axis="x" />
        </div>
        );
      case 1:
        return (<div>
          <Toggle label="Enable Hosting" onToggle={this.toggleClick} toggled={this.state.isHosted} labelPosition="right" />
          <div className="url-text" style={{ marginRight: '4px' }}> creoweb.me/www/ </div>
          <TextField
            hintText="Hostname"
            value={this.state.url}
            onChange={this.urlChange}
            disabled={!this.state.isHosted} />
        </div>);
      case 2:
        return (
          <div>
            <div>
              <TextField
                hintText="Collaborator Email"
                floatingLabelText="Collaborator Email"
                value={this.state.collaborator}
                onChange={this.collaboratorChange}
                errorText={this.state.collaboratorError}
                className="coll-email" />
              <SelectField
                floatingLabelText="Access Level"
                value={this.state.uac}
                onChange={this.uacChange}
                className="access-level"
              >
                <MenuItem value={0} primaryText="Contributor" />
                <MenuItem value={1} primaryText="Administrator" />
              </SelectField>
              <FloatingActionButton mini={true} primary={true} onClick={e => this.addCollaborator()} className="add-coll-btn" zDepth={2}>
                <ContentAdd />
              </FloatingActionButton >
            </div>
            {this.getTable(this.state.tableData)}
          </div>);
      default:
        return 'You\'re a long way from home sonny jim!';
    }
  }
  renderPageContent() {
    if (this.state.sites.length > 0) this.listItems = this.state.sites.map((s, i) => <MenuItem onClick={e => this.setState({ selectedSite: i })} leftIcon={<img src={s.favicon} />} primaryText={s.siteName} />);
    var charts = this.getCharts();
    return (
      <div>
        <Tabs className="dashboard-tabs">
          <Tab label="Dashboard" >
            <div>
              <Card className={this.state.sites.length > 0 ? "dashboard-card" : "hidden-card"}>
                <CardHeader title="Sites" titleStyle={{ fontSize: '2em' }} />
                <div className="sites-scroll">

                  {this.listItems}

                  <FloatingActionButton onClick={this.handleOpen} className="add-btn" secondary={true} zDepth={2}>
                    <Dialog title="Create Site" actions={this.getStepActions(this.state.stepIndex)} modal={false} open={this.state.open} onRequestClose={this.handleClose}>
                      <Stepper activeStep={this.state.stepIndex}>
                        <Step>
                          <StepLabel> Select settings</StepLabel>

                        </Step>
                        <Step>
                          <StepLabel>Host your site</StepLabel>
                        </Step>
                        <Step>
                          <StepLabel>Add Collaborators</StepLabel>
                        </Step>
                      </Stepper>
                      {this.getStepContent(this.state.stepIndex)}

                    </Dialog>
                    <ContentAdd />
                  </FloatingActionButton>
                </div>
              </Card>
              <Dialog title="Edit Site" actions={
                <div>
                  <RaisedButton disabled={this.state.loading4} label="Save Changes" primary={true} onTouchTap={this.saveChanges} />
                  <FlatButton disabled={this.state.loading4} label="Cancel" primary={true} onTouchTap={this.handle5Close} />
                </div>
              } modal={false} open={this.state.open5} onRequestClose={this.handle5Close}>
                <div> <TextField
                  hintText="Site Name"
                  floatingLabelText="Site Name"
                  value={this.state.siteName2}
                  onChange={this.siteName2Change} />
                  <br />
                  <div>
                    Favicon:<img className="fav-img" src={this.state.favicon2} />
                    <FlatButton label="Choose an Image" labelPosition="before">
                      <input onChange={this.favicon2Change} className="fav-input" type="file" />
                    </FlatButton>
                  </div>

                  <TextField hintText="Description" floatingLabelText="Description" className="description-input" value={this.state.description2} onChange={this.description2Change} multiLine={true} rows={1} rowsMax={4} />
                  <br />
                  Storage:{this.state.storage2}
                  <Slider style={{ width: 300 }} onChange={this.handle2Slider} min={1} value={this.state.storage2} step={1} max={32} axis="x" />
                  <Checkbox label="Is Open Source" checked={this.state.isPublic} onCheck={this.isPublicChange} />
                </div>

              </Dialog>

              <Dialog title="License Agreement" actions={
                <div>
                  <RaisedButton disabled={!this.state.agreement} label="OK" primary={true} onTouchTap={this.isPublicTrue} />
                  <FlatButton label="Cancel" primary={true} onTouchTap={this.handle6Close} />
                </div>
              } modal={false} open={this.state.open6} onRequestClose={this.handle6Close}>

                <Checkbox label="I agree to make my project public under the terms of the CC0 License." checked={this.state.agreement} onCheck={this.agreementChange} />
              </Dialog>
              {this.state.loading ? <CircularProgress size={80} thickness={5} className="loading-anim" /> : this.state.sites.length > 0 ?
                <div className="site-cards">
                  <Card className="card-site">
                    <CardHeader avatar={<Avatar className="site-img" src={this.state.sites[this.state.selectedSite].favicon} />} title={this.state.sites[this.state.selectedSite].siteName} titleStyle={{ fontSize: '2em' }} />

                    <CardText>{this.state.sites[this.state.selectedSite].description}</CardText>

                    <IconButton onClick={this.handle2Open} className="del-btn" zDepth={2}>
                      <Dialog title="Delete Site" actions={<div className="btn-div">
                        <FlatButton label="Yes" primary={true} onTouchTap={e => this.delSite(this.state.sites[this.state.selectedSite].id)} />
                        <RaisedButton label="No" primary={true} onTouchTap={this.handle2Close} />
                      </div>} modal={false} open={this.state.open2} onRequestClose={this.handle2Close}>

                        Аre you sure you want to delete this site?

                    </Dialog>
                      <Delete className="icon-color" />
                    </IconButton >
                    <IconButton onClick={this.handle5Open} className="edit-btn" zDepth={2}>

                      <ActionSettings className="icon-color" />
                    </IconButton >
                  </Card>
                  <Dialog title={this.state.isPage2 ? 'Delete Page' : 'Delete Component'} actions={<div className="btn-div">
                    <FlatButton label="Yes" primary={true} onTouchTap={e => this.delComponent()} />
                    <RaisedButton label="No" primary={true} onTouchTap={this.handle4Close} />
                  </div>} modal={false} open={this.state.open4} onRequestClose={this.handle4Close}>

                    Аre you sure you want to delete this {this.state.isPage2 ? 'page' : 'component'}?

                    </Dialog>
                  <div className="pages-div-wrapper">
                    <div className="pages-div">
                      <p className="pages-text">Pages</p>
                      <FloatingActionButton mini={true} secondary={true} onClick={e => this.handle3Open(true)} className="page-btn" zDepth={2}>
                        <Dialog title={this.state.isPage ? 'Add a page' : 'Add a component'} actions={<div className="btn-div">
                          <RaisedButton disabled={this.state.loading3} label="Add" primary={true} onTouchTap={this.addPage} />
                          <FlatButton disabled={this.state.loading3} label="Cancel" primary={true} onTouchTap={this.handle3Close} />
                        </div>} modal={false} open={this.state.open3} onRequestClose={this.handle3Close}>

                          <TextField hintText={this.state.isPage ? 'Page Title' : 'Component Title'} floatingLabelText={this.state.isPage ? 'Page Title' : 'Component Title'} className="page-input" value={this.state.pageName} onChange={this.pageNameChange} rows={1} rowsMax={4} />
                          <br />
                          <TextField hintText="Description" floatingLabelText="Description" className="description-input" value={this.state.pageDescription} onChange={this.pageDescriptionChange} multiLine={true} rows={1} rowsMax={4} />
                        </Dialog>
                        <ContentAdd />
                      </FloatingActionButton >
                    </div>
                    <div className="pages-div">
                      <p className="pages-text">Components</p>
                      <FloatingActionButton mini={true} secondary={true} onClick={e => this.handle3Open(false)} className="page-btn" zDepth={2}>
                        <ContentAdd />
                      </FloatingActionButton >
                    </div>
                  </div>
                  <div className="components-pages-wrapper">
                    <div className="pages-scroll">
                      {this.getPages()}
                    </div>
                    <div className="components-scroll">
                      {this.getComponents()}
                    </div>
                  </div>
                </div>
                : <div> <h3 className="no-sites" ><Translate message="DASHBOARD.SITES.LIST_EMPTY" /></h3>
                  <RaisedButton label="Create a site" onClick={this.handleOpen} className="no-sites-btn" secondary={true} zDepth={2}>

                  </RaisedButton></div>}

            </div>
          </Tab>
          <Tab label="Storage" >
            <div>
              <Card className={this.state.sites.length > 0 ? "dashboard-card" : "hidden-card"}>
                <CardHeader title="Storage" titleStyle={{ fontSize: '2em' }} />
                <div className="sites-scroll">

                  {this.listCharts()}


                </div>
              </Card>
              <Card className="chart-card" >
                <CardHeader title={charts != null ? charts[this.state.selectedChart].siteName : ''} titleStyle={{ fontSize: '2em' }} />
                <Chart width="300" height="300" className="chart-canvas" options={{
                  type: 'doughnut',
                  data: {
                    labels: [
                      "Free Space (MB)",
                      "Used (MB)",
                    ],
                    datasets: [
                      {
                        data: charts != null ? [charts[this.state.selectedChart].storage - charts[this.state.selectedChart].size, charts[this.state.selectedChart].size] : [25.784, 6.216],
                        backgroundColor: [
                          "#C6FF00",
                          "#d7d7d7",
                        ],
                        hoverBackgroundColor: [
                          "#C6FF00",
                          "#d7d7d7",
                        ]
                      }]
                  },
                  options: {
                    cutoutPercentage: 70,
                    responsive: false,
                    legend: {
                      position: 'top',
                    },
                    /*     title: {
                           display: true,
                           text: 'Storage'
                         },*/
                    animation: {
                      animateScale: true,
                      animateRotate: true
                    }
                  }
                }} />
                {/*
                <Chart width="300" height="300" className="chart-canvas" options={{
                  type: 'doughnut',
                  data: {
                    labels: [
                      "Free Space",
                      "Used",
                    ],
                    datasets: [
                      {
                        data: [18, 14],
                        backgroundColor: [
                          "#C6FF00",
                          "#d7d7d7",
                        ],
                        hoverBackgroundColor: [
                          "#C6FF00",
                          "#d7d7d7",
                        ]
                      }]
                  },
                  options: {
                    cutoutPercentage: 70,
                    responsive: false,
                    legend: {
                      position: 'top',
                    },
                       title: {
                         display: true,
                         text: 'Storage'
                       },
                    animation: {
                      animateScale: true,
                      animateRotate: true
                    }
                  }
                }} />*/}
              </Card>
            </div>
          </Tab>
          {/*
          <Tab label="Settings">
            <div>
              <h1 className="under-construction-text" >This page is currently under construction.</h1>
              <h4 className="under-construction-text" >New content is coming soon.</h4>
            </div>
          </Tab>
          */}
        </Tabs>
      </div>
    );
  }

}

DashboardPage.contextTypes = Link.contextTypes;
export default connect(state => ({ auth: state.auth, project: state.project }))(DashboardPage);

