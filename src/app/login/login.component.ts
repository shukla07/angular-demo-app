import {
  Component,
  ViewChild,
  ViewEncapsulation,
  TemplateRef,
  ElementRef,
} from '@angular/core';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {NgForm} from '@angular/forms';
import {AuthService} from '@vmsl/core/auth/auth.service';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {ToastrService} from 'ngx-toastr';
import {environment} from '@vmsl/env/environment';
import {CountdownComponent} from 'ngx-countdown';
import {NbDialogModule, NbDialogService} from '@nebular/theme';
import {NgOtpInputComponent} from 'ng-otp-input/lib/components/ng-otp-input/ng-otp-input.component';
import {MsalService} from '@azure/msal-angular';
import {AzureMsalFacadeService} from '@vmsl/shared/facades/azure-msal-facade.service';
import * as OT from '@opentok/client';
import {deviceIncompatible} from '../../assets/message/notification';
import {ClientAuthError, InteractionRequiredAuthError} from 'msal';
@Component({
  selector: 'kyodome-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent extends RouteComponentBase {
  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly authService: AuthService,
    protected readonly store: UserSessionStoreService,
    protected readonly toastr: ToastrService,
    protected readonly router: Router,
    private readonly dialogService: NbDialogService,
    private readonly el: ElementRef,
    private readonly msalAuthService: MsalService,
    private readonly profileService: AzureMsalFacadeService,
  ) {
    super(route, location);
  }
  @ViewChild('countDown', {static: false}) countdown: CountdownComponent;
  @ViewChild('dialog', {read: TemplateRef}) dialog: TemplateRef<NbDialogModule>;
  @ViewChild('ngOtpInput', {static: false}) ngOtpInput: NgOtpInputComponent;

  loginTemplate = true;
  loading = false;
  secret: string;
  otp = '';
  otpLoading = false;
  user = {
    username: '',
    password: '',
  };
  resendLink: boolean;
  showTimer = false;
  lastRoute: string;
  ssoEnabled = false;
  isPfizer = false;

  ngOnInit() {
    super.ngOnInit();
    if (!OT.checkSystemRequirements()) {
      this.toastr.warning(deviceIncompatible, 'Incompatible Browser', {
        timeOut: environment.messageTimeout,
      });
    }
    this.checkIfSsoEnabled();

    // // terms & condition Link
    if(this.store.getSsoTentConfigs()){
      this.isPfizer = this.store.getSsoTentConfigs()['key'] === 'pfizer';
    }
  }

  ngAfterViewInit() {
    this.lastRoute = this.store.getLastRoute();
    this.showMessages();
    if (this.store.getMessage() === 'sessionExpire') {
      this.store.removeMessage();
      this.dialogService.open(this.dialog);
    }
  }

  ngAfterViewChecked() {
    const elements = this.el.nativeElement as HTMLElement;
    const otpInput = elements.querySelectorAll('.otp-input');

    otpInput.forEach(element => {
      element.setAttribute('inputmode', 'numeric');
      element.setAttribute('autocomplete','one-time-code');
    });
  }

  checkIfSsoEnabled() {
    if (
      this.store.getSsoTentConfigs() &&
      this.store.getSsoTentConfigs()['isSsoAllowed']
    ) {
      this.ssoEnabled = true;
    }
  }

  loginWithMicrosoft() {
    const audio = new Audio('../../assets/audio/login-sound.wav');
    audio.volume = 0.1;
    audio.play();
    const isIE =
      window.navigator.userAgent.indexOf('MSIE ') > -1 ||
      window.navigator.userAgent.indexOf('Trident/') > -1;

    if (isIE) {
      this.msalAuthService.loginRedirect({
        extraScopesToConsent: ['user.read', 'openid', 'profile'],
      });
    } else {
      this.msalAuthService.loginPopup({
        extraScopesToConsent: ['user.read', 'openid', 'profile'],
      });
      this.loginWithMicrosoftSilent();
    }
  }

  loginWithMicrosoftSilent() {
    const requestObj = {
      scopes: ['user.read', 'openid', 'profile'],
    };
    this.msalAuthService
      .acquireTokenSilent(requestObj)
      .then(tokenResponse => {
        this.onMSLoginCallback(
          tokenResponse.idToken.rawIdToken,
          tokenResponse.accessToken,
        );
      })
      .catch(error => {
        if (
          error instanceof InteractionRequiredAuthError ||
          error instanceof ClientAuthError
        ) {
          this.loginWithMicrosoftPopup();
        }
      });
  }

  loginWithMicrosoftPopup() {
    const requestObj = {
      scopes: ['user.read', 'openid', 'profile'],
    };
    this.msalAuthService.loginPopup(requestObj).then(response => {
      this.loginWithMicrosoftSilent();
    });
  }

  onMSLoginCallback(idToken, accessToken) {
    this._subscriptions.push(
      this.profileService
        .msLoginCallback(idToken, accessToken)
        .subscribe(resp => {
          const response = JSON.parse(JSON.stringify(resp));
          if (response.accessToken && response.refreshToken) {
            this.store.saveAccessToken(response.accessToken);
            this.store.saveRefreshToken(response.refreshToken);
            this.store.setPubnubSubsKey(response.subscriptionKey);

            // we have added environment.baseUrl in href., as we have to redirect pfizer login to
            // main site login page.
            if (this.lastRoute && this.lastRoute !== '/main/myProfile') {
              window.location.href = this.lastRoute;
            } else {
              window.location.href = environment.homePath;
            }
          }
        }),
    );
  }

  login(form: NgForm): void {
    const audio = new Audio('../../assets/audio/login-sound.wav');
    audio.volume = 0.1;
    audio.play();
    this.checkLastLogin();
    this.resendLink = false;
    if (!form) {
      this.ngOtpInput.setValue(null);
      this.otp = '';
    }
    if (this.countdown) {
      this.countdown.restart();
    }
    if (form && form.invalid) {
      return;
    }
    this.loading = true;
    this._subscriptions.push(
      this.authService.login(this.user.username, this.user.password).subscribe(
        response => {
          this.secret = response.body.code;
          if (response.body.isMfaActive) {
            this.loginTemplate = false;
            this.showTimer = true;
            this.loading = false;
            this.toastr.info(
              'One-Time Passcode has been sent to your registered mobile number.',
              null,
              {
                timeOut: environment.messageTimeout,
              },
            );
          } else {
            this.authorizeUser();
          }
        },
        err => {
          this.loading = false;
        },
      ),
    );
  }

  checkLastLogin() {
    if (this.store.getAccessToken()) {
      this.store.clearAll();
    }
  }

  stopTimer(timeLeft) {
    const resendOtpInterval = 270000;

    if (timeLeft.left === 0) {
      this.showTimer = false;
    }
    if (timeLeft.left === resendOtpInterval) {
      this.resendLink = true;
    }
  }

  authorizeUser(): void {
    this.otpLoading = true;
    this._subscriptions.push(
      this.authService.authorize(this.secret, this.otp).subscribe(
        response => {
          if (response.accessToken && response.refreshToken) {
            this.store.saveAccessToken(response.accessToken);
            this.store.saveRefreshToken(response.refreshToken);
            this.store.setPubnubSubsKey(response.subscriptionKey);

            // we have added environment.baseUrl in href., as we have to redirect pfizer login to
            // main site login page.
            if (this.lastRoute && this.lastRoute !== '/main/myProfile') {
              window.location.href = this.lastRoute;
            } else {
              window.location.href = environment.homePath;
            }
          }
        },
        err => {
          this.otpLoading = false;
          this.loading = false;
        },
      ),
    );
  }

  onOtpChange(otp: string) {
    this.otp = otp;
  }

  navigateToEmail() {
    this.store.setUserEmail(this.user.username);
    this.router.navigate(['/forgot-password']);
  }

  showMessages() {
    let title: string;
    let message: string;
    if (
      this.store.getMessage() &&
      this.store.getMessage() !== 'sessionExpire'
    ) {
      switch (this.store.getMessage()) {
        case 'savedPassword':
          title = 'Password has been reset successfully.';
          message = 'Please login to proceed.';
          break;
        case 'registrationComplete':
          title = 'Registration completed successfully.';
          message = 'Please login to proceed.';
          break;
      }
      this.store.removeMessage();
      this.toastr.success(message, title, {
        timeOut: environment.messageTimeout,
      });
    }
  }

  goToHcpRegister() {
    this.router.navigate(['/hcp/register']);
  }

  navigateToHcpLogin() {
    this.router.navigate(['/hcp/login']);
  }
}
