import {Numbers} from './numbers.enum';

export enum RoleType {
  SuperAdmin = Numbers.numberTwo,
  Director,
  Administrator,
  superMSL,
  msl,
  hcp,
  jrHcp = Numbers.numberNine,
}

export enum RoleName {
  superAdmin = 'Super Admin',
  director = 'Sponsor Director',
  admin = 'Administrator',
  superMSL = 'Sponsor Manager',
  msl = 'Sponsor User',
  hcp = 'Health Care Professional',
}
