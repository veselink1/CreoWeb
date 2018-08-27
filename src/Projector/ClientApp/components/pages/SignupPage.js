import PageBase from './PageBase';
import { Paper, RaisedButton, TextField, LinearProgress, Checkbox } from 'material-ui';
import { connect } from 'react-redux';
import { Step, Stepper, StepLabel, StepContent, e1 } from 'material-ui/Stepper';
import DatePicker from 'material-ui/DatePicker';
import { blue500 } from 'material-ui/styles/colors';
import { Card, CardHeader, CardText, CardActions } from 'material-ui/Card';
import { Link } from 'react-router';
import { AppBar, FlatButton } from 'material-ui';
import { getUsernameErrorText, getEmailErrorText, getPasswordErrorText, getNameErrorText } from '~/utils/validate';
import Translate, { translateMessage, addTranslationContext } from '~/components/Translate';

typeof window !== 'undefined'
  && require('~/styles/signup-page.scss');

export class SignupPage extends PageBase {
  constructor(props) {
    super(props, { isImmersive: false, title: "Signup", backgroundStyle: 'url("/img/bg/login-bg.jpg") center/cover' });
    this.state = {
      user: "",
      pass: "",
      confirmPass: "",
      passError: "",
      firstName: "",
      lastName: "",
      email: "",
      finished: false,
      stepIndex: 0,
      date: new Date(),
      usernameError: "",
      emailError: "",
      userChanged: false,
      emailChanged: false,
      passChanged: false,
      firstNameChanged: false,
      lastNameChanged: false,
      doesAgree: false,
    };

    this.userChange = this.userChange.bind(this);
    this.passChange = this.passChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.passConfirm = this.passConfirm.bind(this);
    this.firstNameChange = this.firstNameChange.bind(this);
    this.lastNameChange = this.lastNameChange.bind(this);
    this.emailChange = this.emailChange.bind(this);
    this.dateChange = this.dateChange.bind(this);
    this.handlePrev = this.handlePrev.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.checkUser = this.checkUser.bind(this);
    this.stopKey = this.stopKey.bind(this);
  }
  stopKey(event) {
    if (event.keyCode === 32) {
      event.preventDefault();
    }
  }
  handleNext(event) {
    const {stepIndex} = this.state;
    this.setState({
      stepIndex: stepIndex + 1,
      finished: stepIndex >= 2,
    });
  }
  checkUser(event) {
    const translate = translateMessage.bind(null, this.context.translationContext);

    var data = JSON.stringify({ "Username": this.state.user, "Email": this.state.email });
    var request = new Request('/api/User/CheckUser', { method: 'POST', body: data, headers: new Headers({ "Content-Type": "application/json" }) });
    this.setState({ isFetching: true });
    fetch(request).then((response) => {
      this.setState({ isFetching: false });
      return response.json();
    }).then((json) => {
      if (!json.usernameExists && !json.emailExists) {
        this.handleNext();
      }
      else {
        if (json.usernameExists) this.setState({ usernameError: translate("SIGNUP.USERNAME_EXISTS") });
        else this.setState({ usernameError: "" });
        if (json.emailExists) this.setState({ emailError: translate("SIGNUP.EMAIL_EXISTS") });
        else this.setState({ emailError: "" });
      }
    }).catch(err => {
      // Error :(
      console.log(err);
      this.setState({ isFetching: false });
    });
  }
  handlePrev(event) {
    const {stepIndex} = this.state;
    if (stepIndex > 0) {
      this.setState({ stepIndex: stepIndex - 1 });
    }
  }

  renderStepActions(step) {
    const translate = translateMessage.bind(null, this.context.translationContext);

    const {stepIndex} = this.state;
    var click;
    var enabled = true;
    if (stepIndex === 0) {
      click = this.handleNext;
      enabled = !getNameErrorText(this.state.firstName)
        && !getNameErrorText(this.state.lastName);
    }
    if (stepIndex === 1) {
      click = this.checkUser;
      enabled = !getUsernameErrorText(this.state.user)
        && !this.state.usernameError
        && !getEmailErrorText(this.state.email)
        && !this.state.emailError
        && !this.state.isFetching;
    }
    if (stepIndex === 2) {
      click = this.handleSubmit;
      enabled = !getPasswordErrorText(this.state.pass)
        && !this.state.passError
        && this.state.doesAgree;
    }
    return (
      <div style={{ margin: '12px 0' }}>
        <RaisedButton
          label={stepIndex === 2 ? translate("SIGNUP.FINISH_BUTTON") : translate("SIGNUP.NEXT_BUTTON")}
          disabled={!enabled}
          primary={true}
          onTouchTap={click}
          style={{ marginRight: 12 }}
          />
        {step > 0 && (
          <FlatButton
            label={translate("SIGNUP.BACK_BUTTON")}
            disabled={stepIndex === 0}
            onTouchTap={this.handlePrev}
            />
        )}
      </div>
    );
  }
  userChange(event) {
    this.setState({ user: event.target.value, userChanged: true });
    this.setState({ usernameError: "" });
  }
  firstNameChange(event) {
    this.setState({ firstName: event.target.value, firstNameChanged: true });
  }
  lastNameChange(event) {
    this.setState({ lastName: event.target.value, lastNameChanged: true });
  }
  emailChange(event) {
    this.setState({ email: event.target.value, emailChanged: true });
    this.setState({ emailError: "" });
  }
  dateChange(event, date) {
    this.setState({ date: date, });
  }
  passChange(event) {
    const translate = translateMessage.bind(null, this.context.translationContext);

    this.setState({ pass: event.target.value, passChanged: true });
    if (this.state.confirmPass === event.target.value) {
      this.state.passError = "";
    }
    else {
      this.state.passError = translate("SIGNUP.PASSWORDS_DONT_MATCH");
    }
  }
  passConfirm(event) {
    const translate = translateMessage.bind(null, this.context.translationContext);
    this.setState({ confirmPass: event.target.value });
    if (this.state.pass === event.target.value) {
      this.state.passError = "";
    }
    else {
      this.state.passError = translate("SIGNUP.PASSWORDS_DONT_MATCH");
    }
  }
  handleSubmit(event) {
    var data = JSON.stringify({ "Username": this.state.user, "FirstName": this.state.firstName, "LastName": this.state.lastName, "Password": this.state.pass, "Email": this.state.email, "BirthDate": this.state.date });
    var request = new Request('/api/User', { method: 'POST', body: data, headers: new Headers({ "Content-Type": "application/json" }) });
    this.setState({ isFetching: true })
    fetch(request)
      .then((response) => {
        if (response.ok) {
          this.handleNext();
          this.setState({ isFetching: false });
        } else {
          console.error("Creating user failed!", response);
        }
      }).catch(err => {
        // Error :(
        console.log(err);
        this.setState({ isFetching: false })
      });

  }


  renderPageContent() {
    const translate = translateMessage.bind(null, this.context.translationContext);

    return (
      <div className="signup-page">

        <Card className="signup-paper" zDepth={1}>
          <CardHeader title={translate("SIGNUP.SIGNUP_HEADER")} titleStyle={{ fontSize: '1.8em' }} />
          <Stepper activeStep={this.state.stepIndex} orientation="vertical">
            <Step>
              <StepLabel>{translate("SIGNUP.PERSONAL_INFORMATION_HEADER")}</StepLabel>
              <StepContent>
                <TextField
                  fullWidth={true}
                  errorText={this.state.firstNameChanged ? translate(getNameErrorText(this.state.firstName, 'first')) : null}
                  onKeyDown={this.stopKey}
                  hintText={translate("SIGNUP.FIRST_NAME_LABEL")}
                  floatingLabelText={translate("SIGNUP.FIRST_NAME_LABEL")}
                  value={this.state.firstName}
                  onChange={this.firstNameChange} />
                <br />
                <TextField
                  fullWidth={true}
                  errorText={this.state.lastNameChanged ? translate(getNameErrorText(this.state.lastName, 'last')) : null}
                  onKeyDown={this.stopKey}
                  hintText={translate("SIGNUP.LAST_NAME_LABEL")}
                  floatingLabelText={translate("SIGNUP.LAST_NAME_LABEL")}
                  value={this.state.lastName}
                  onChange={this.lastNameChange} />
                <br />
                <DatePicker
                  fullWidth={true}
                  hintText={translate("SIGNUP.BIRTH_DATE_LABEL")}
                  onChange={this.dateChange}
                  floatingLabelText={translate("SIGNUP.BIRTH_DATE_LABEL")}
                  mode="landscape" />
                <br />
                {this.renderStepActions(0)}
              </StepContent>
            </Step>
            <Step>
              <StepLabel>{translate("SIGNUP.CREDENTIALS_HEADER")}</StepLabel>
              <StepContent>
                <TextField
                  fullWidth={true}
                  errorText={this.state.usernameError || (this.state.userChanged ? translate(getUsernameErrorText(this.state.user)) : null)}
                  onKeyDown={this.stopKey}
                  hintText={translate("SIGNUP.USERNAME_LABEL")}
                  floatingLabelText={translate("SIGNUP.USERNAME_LABEL")}
                  value={this.state.user}
                  onChange={this.userChange} />
                <br />
                <TextField
                  fullWidth={true}
                  onKeyDown={this.stopKey}
                  hintText={translate("SIGNUP.EMAIL_LABEL")}
                  errorText={this.state.emailError || (this.state.emailChanged ? translate(getEmailErrorText(this.state.email)) : null)}
                  floatingLabelText={translate("SIGNUP.EMAIL_LABEL")}
                  value={this.state.email}
                  onChange={this.emailChange} />
                <br />
                {this.renderStepActions(1)}
              </StepContent>
            </Step>
            <Step>
              <StepLabel>{translate("SIGNUP.CREATE_PASSWORD_HEADER")}</StepLabel>
              <StepContent>
                <TextField
                  errorText={this.state.passChanged ? translate(getPasswordErrorText(this.state.pass)) : null}
                  onKeyDown={this.stopKey}
                  hintText={translate("SIGNUP.PASSWORD_LABEL")}
                  floatingLabelText={translate("SIGNUP.PASSWORD_LABEL")}
                  type="password"
                  value={this.state.pass}
                  onChange={this.passChange} />
                <br />
                <TextField
                  onKeyDown={this.stopKey}
                  hintText={translate("SIGNUP.CONFIRM_PASSWORD_LABEL")}
                  errorText={this.state.passError}
                  floatingLabelText={translate("SIGNUP.CONFIRM_PASSWORD_LABEL")}
                  value={this.state.confirmPass}
                  type="password"
                  onChange={this.passConfirm} />
                <br />
                <Checkbox defaultChecked={false} onCheck={(e, v) => this.setState({ doesAgree: v })} label={<Translate message="SIGNUP.I_AGREE_TERMS" />} labelStyle={{ fontSize: '14px' }} className="terms-checkbox" />
                {this.renderStepActions(2)}
              </StepContent>
            </Step>
          </Stepper>

          {this.state.finished && (
            <p style={{ margin: '20px 0', textAlign: 'center' }}>
              {translate("SIGNUP.SIGNUP_SUCCESS")}
              <div style={{ marginTop: '1em', display: 'inline-block' }}>
                <Link to="/Dashboard"><RaisedButton label={translate("SIGNUP.START_CREATING_BUTTON")} secondary={true} style={{ margin: '4px' }} /></Link>
              </div>
            </p>
          )}

        </Card>
      </div>
    );
  }

}

addTranslationContext(SignupPage);

export default connect()(SignupPage);

