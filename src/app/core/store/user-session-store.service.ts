import {Inject, Injectable} from '@angular/core';
import {InMemoryStorageService, StorageService} from 'ngx-webstorage-service';

import {StoreKeys} from './store-keys.enum';
import {APPLICATION_STORE, APP_SESSION_STORE} from './store.interface';
import {UserInfo} from '../auth/models/user.model';
import {Call} from '../../main/audio-video/shared/models/call.model';
import {TeamInfo} from '../../main/teams-management/shared/models/team-info.model';
import {CalendarTenantConfig} from '../../main/profile/shared/models/tenant-calendar-config.model';

@Injectable()
export class UserSessionStoreService {
  constructor(
    @Inject(APPLICATION_STORE)
    private readonly localStore: StorageService,
    @Inject(APP_SESSION_STORE)
    private readonly sessionStore: StorageService,
    private readonly inMemoryStore: InMemoryStorageService,
  ) {}

  public saveAccessToken(token: string): boolean {
    this.localStore.set(StoreKeys.ACCESS_TOKEN_KEY, token);
    return true;
  }

  public getAccessToken(): string {
    return this.localStore.get(StoreKeys.ACCESS_TOKEN_KEY);
  }

  public removeAccessToken(): boolean {
    this.localStore.remove(StoreKeys.ACCESS_TOKEN_KEY);
    return true;
  }

  public saveRefreshToken(token: string): boolean {
    this.localStore.set(StoreKeys.REFRESH_TOKEN_KEY, token);
    return true;
  }

  public getRefreshToken(): string {
    return this.localStore.get(StoreKeys.REFRESH_TOKEN_KEY);
  }

  public removeRefreshToken(): boolean {
    this.localStore.remove(StoreKeys.REFRESH_TOKEN_KEY);
    return true;
  }

  public setPubnubSubsKey(key: string) {
    this.localStore.set(StoreKeys.SUBSCRIPTION_KEY, key);
  }

  public getPubnubSubsKey(): string {
    return this.localStore.get(StoreKeys.SUBSCRIPTION_KEY);
  }

  public removePubnubSubsKey(): boolean {
    this.localStore.remove(StoreKeys.SUBSCRIPTION_KEY);
    return true;
  }

  public setUser(user: UserInfo): void {
    this.inMemoryStore.set(StoreKeys.USER_KEY, user);
  }

  public getUser(): UserInfo {
    return this.inMemoryStore.get(StoreKeys.USER_KEY);
  }

  public setCalTenantConfig(config: CalendarTenantConfig): void {
    this.sessionStore.set(StoreKeys.CAL_TENANT_CONFIG, config);
  }
  public getCalTenantConfig(): CalendarTenantConfig {
    return this.sessionStore.get(StoreKeys.CAL_TENANT_CONFIG);
  }
  public removeCalTenantConfig() {
    return this.sessionStore.remove(StoreKeys.CAL_TENANT_CONFIG);
  }

  public setUserEmail(email: string): void {
    this.inMemoryStore.set(StoreKeys.USER_EMAIL, email);
  }
  public getUserEmail(): string {
    return this.inMemoryStore.get(StoreKeys.USER_EMAIL);
  }

  public setUserTimeZone(timezone: string): void {
    this.inMemoryStore.set(StoreKeys.TIME_ZONE, timezone);
  }
  public getUserTimeZone(): string {
    return this.inMemoryStore.get(StoreKeys.TIME_ZONE);
  }

  public setCallData(data: Call): void {
    this.sessionStore.set(StoreKeys.CALL_DATA, data);
  }
  public getCallData(): Call {
    return this.sessionStore.get(StoreKeys.CALL_DATA);
  }
  public removeCallData() {
    return this.sessionStore.remove(StoreKeys.CALL_DATA);
  }

  public setMaCallData(data: Call): void {
    this.localStore.set(StoreKeys.CALL_DATA, data);
  }
  public getMaCallData(): Call {
    return this.localStore.get(StoreKeys.CALL_DATA);
  }
  public removeMaCallData() {
    return this.localStore.remove(StoreKeys.CALL_DATA);
  }

  public setMessage(msg: string): void {
    this.localStore.set(StoreKeys.MESSAGE, msg);
  }
  public getMessage(): string {
    return this.localStore.get(StoreKeys.MESSAGE);
  }
  public removeMessage(): boolean {
    this.localStore.remove(StoreKeys.MESSAGE);
    return true;
  }

  public setCallTab(tab: boolean): void {
    this.localStore.set(StoreKeys.CALL_TAB, tab);
  }
  public getCallTab(): boolean {
    return this.localStore.get(StoreKeys.CALL_TAB);
  }
  public removeCallTab(): boolean {
    this.localStore.remove(StoreKeys.CALL_TAB);
    return true;
  }

  public setJrHcpLogin(isLogin: boolean): void {
    this.localStore.set(StoreKeys.JR_HCP_LOGIN, isLogin);
  }
  public getJrHcpLogin(): boolean {
    return this.localStore.get(StoreKeys.JR_HCP_LOGIN);
  }
  public removeJrHcpLogin() {
    this.localStore.remove(StoreKeys.JR_HCP_LOGIN);
  }

  public setCalSync(isCalSync: boolean): void {
    this.localStore.set(StoreKeys.CAL_SYNC, isCalSync);
  }
  public getCalSync(): boolean {
    return this.localStore.get(StoreKeys.CAL_SYNC);
  }
  public deleteCalSync() {
    return this.localStore.remove(StoreKeys.CAL_SYNC);
  }

  public setlastActivity(time: Date): void {
    this.localStore.set(StoreKeys.LAST_ACTIVITY, time);
  }
  public getlastActivity(): Date {
    return this.localStore.get(StoreKeys.LAST_ACTIVITY);
  }
  public removelastActivity() {
    this.localStore.remove(StoreKeys.LAST_ACTIVITY);
  }

  public setLastRoute(route: string): void {
    this.localStore.set(StoreKeys.LAST_ROUTE, route);
  }
  public getLastRoute(): string {
    return this.localStore.get(StoreKeys.LAST_ROUTE);
  }
  public removeLastRoute() {
    this.localStore.remove(StoreKeys.LAST_ROUTE);
  }

  public setTeams(teams: TeamInfo[]): void {
    this.inMemoryStore.set(StoreKeys.TEAMS, teams);
  }
  public getTeams(): TeamInfo[] {
    return this.inMemoryStore.get(StoreKeys.TEAMS);
  }
  public removeTeams(): void {
    this.inMemoryStore.remove(StoreKeys.TEAMS);
  }

  public setCallConnected(connected: boolean): void {
    this.sessionStore.set(StoreKeys.CALL_CONNECTED, connected);
  }
  public getCallConnected(): boolean {
    return this.sessionStore.get(StoreKeys.CALL_CONNECTED);
  }

  public setCallDuration(duration: number): void {
    this.sessionStore.set(StoreKeys.CALL_DURATION, duration);
  }
  public getCallDuration(): number {
    return this.sessionStore.get(StoreKeys.CALL_DURATION);
  }

  public setCallDeclined(declined: boolean): void {
    this.sessionStore.set(StoreKeys.CALL_DECLINED, declined);
  }
  public getCallDeclined(): number {
    return this.sessionStore.get(StoreKeys.CALL_DECLINED);
  }

  public setSsoTentConfigs(ssoConfig: object): void {
    this.sessionStore.set(StoreKeys.SSO_CONFIG, ssoConfig);
  }
  public getSsoTentConfigs(): object {
    return this.sessionStore.get(StoreKeys.SSO_CONFIG);
  }

  public setIsCalSyncing(isCalSyncing: boolean): void {
    this.sessionStore.set(StoreKeys.CAL_SYNCING, isCalSyncing);
  }
  public getIsCalSyncing(): boolean {
    return this.sessionStore.get(StoreKeys.CAL_SYNCING);
  }

  public setAuditLogPDFStatus(key: boolean) {
    this.localStore.set(StoreKeys.AUDIT_LOG_PDF_STATUS, key);
  }

  public getAuditLogPDFStatus(): boolean {
    return this.localStore.get(StoreKeys.AUDIT_LOG_PDF_STATUS);
  }

  public clearAll(): void {
    let message;
    if (this.getMessage()) {
      message = this.getMessage();
    }
    this.inMemoryStore.clear();
    this.sessionStore.clear();
    this.localStore.clear();
    if (message) {
      this.setMessage(message);
    }
  }
}
