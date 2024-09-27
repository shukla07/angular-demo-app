// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  homePath: '/main/home',
  // authApiUrl: 'https://vmsl-api.sourcef.us/auth-service',
  // userApiUrl: 'https://vmsl-api.sourcef.us/tenant-user-facade',
  authApiUrl: 'http://localhost:4001/auth-service',
  userApiUrl: 'http://localhost:4003/tenant-user-facade',
  chatApiUrl: 'https://vmsl-api.sourcef.us/chat-facade',
  clientId: 'webapp',
  clientSecret: 'saqw21!@',
  messageTimeout: 5000,
  mock: false,
  baseUrl: 'https://vmsl.sourcef.us',
  recaptchaKey: '6LfcvvMUAAAAABOlQxeZZe_Q88fU6H167EC0Cjoo',
  orgId: '',
  debug: false,
  namespace: 'FS',
  defaultClientId: '555c81ff-2808-42f9-92c8-9d1598e77bf2',
  defaultTenantId: '831117d8-8fb9-11ea-9ce0-0e965b29d6db',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
