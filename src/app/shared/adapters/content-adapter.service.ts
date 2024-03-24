import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {Content} from '../../main/content-management/shared/models/content-info.model';
import * as moment from 'moment';
import {
  AccessRules,
  AccessRulesAssociation,
} from '@vmsl/core/auth/models/user.model';
import {DivisionStates} from '@vmsl/core/enums/division-states.enum';
import {RoleName, ContentType} from '@vmsl/core/enums';

@Injectable()
export class ContentAdapter implements IAdapter<any> {
  adaptToModel(resp: any) {
    if (resp) {
      const content = new Content();
      content.id = resp.id;
      content.createdByName = resp.createdByName;
      content.title = resp.title;
      content.contentText = resp.contentText;
      content.tenantId = resp.tenantId;
      content.listImg = this.getListImg(resp).listImg;
      content.fileUrl = resp.fileUrl;
      content.fileKey = resp.fileKey;
      content.fileType = resp.fileType;
      content.fileIcon = this.getListImg(resp).fileIcon;
      content.isDownloadable = this.getListImg(resp).isDownloadable;
      content.status = resp.status;
      content.createdOn = moment(resp.createdOn).format('DD/MM/YYYY, HH:mm A');
      content.unrestricted = resp.unrestricted ? resp.unrestricted : false;
      content.dsFlag = resp.dsFlag;
      content.teamsFlag = resp.teamsFlag;
      content.hcpFlag = resp.hcpFlag;
      if (!resp.unrestricted && resp.dsConfig) {
        content.dsTags = this.getDsTags(resp);
      }
      if (!resp.unrestricted && resp.teamsFlag) {
        content.teamsTags = this.getTeamTags(resp);
      }
      if (!resp.unrestricted && resp.hcpFlag) {
        content.hcpTags = this.getHcpTags(resp);
      }
      return content;
    }
    return resp;
  }
  adaptFromModel(data: Content) {
    const dataResp = {
      contentDetails: {
        id: data.id,
        title: data.title,
        contentText: data.contentText,
        status: data.status,
        fileKey: data.fileKey,
        fileType: data.fileType,
        unrestricted: data.unrestricted,
        dsFlag: data.dsFlag ? 1 : 0,
        teamsFlag: data.teamsFlag ? 1 : 0,
        hcpFlag: data.hcpFlag ? 1 : 0,
      },
    };
    if (data.dsFlag) {
      const two = 2;
      dataResp['territoryDivision'] = data.dsTags[0].selected;
      dataResp['diseaseDivision'] = data.dsTags[two].selected;
      dataResp['therapeuticDivision'] = data.dsTags[1].selected;
    }
    if (data.teamsFlag) {
      dataResp['teamsContent'] = data.teamsTags[0].selected;
    }
    if (data.hcpFlag) {
      dataResp['hcpContent'] = data.hcpTags[0].selected;
    }
    return dataResp;
  }
  getDsTags(content) {
    let territory: AccessRules;
    if (content.dsConfig.territoryDivTag === 'some') {
      territory = new AccessRules(
        DivisionStates.territory,
        AccessRulesAssociation.some,
      );
    } else {
      territory = new AccessRules(
        DivisionStates.territory,
        AccessRulesAssociation.all,
      );
    }
    if (content.territory) {
      territory.elements = content.territory;
      territory.selected =
        content.territory && content.territory.map(ele => ele.id);
    } else {
      territory.elements = [];
      territory.selected = [];
    }

    let ta: AccessRules;
    if (content.dsConfig.therapeuticDivTag === 'some') {
      ta = new AccessRules(
        DivisionStates.therapeuticArea,
        AccessRulesAssociation.some,
      );
    } else {
      ta = new AccessRules(
        DivisionStates.therapeuticArea,
        AccessRulesAssociation.all,
      );
    }
    if (content.therapeuticAreas) {
      ta.elements = content.therapeuticAreas;
      ta.selected =
        content.therapeuticAreas && content.therapeuticAreas.map(ele => ele.id);
    } else {
      ta.elements = [];
      ta.selected = [];
    }

    let da: AccessRules;
    if (content.dsConfig.diseaseDivTag === 'some') {
      da = new AccessRules(
        DivisionStates.diseaseArea,
        AccessRulesAssociation.some,
      );
    } else {
      da = new AccessRules(
        DivisionStates.diseaseArea,
        AccessRulesAssociation.all,
      );
    }
    if (content.diseaseAreas) {
      da.elements = content.diseaseAreas;
      da.selected =
        content.diseaseAreas && content.diseaseAreas.map(ele => ele.id);
    } else {
      da.elements = [];
      da.selected = [];
    }
    return [territory, ta, da];
  }
  getHcpTags(content) {
    const hcpCont = new AccessRules(RoleName.hcp, AccessRulesAssociation.na);

    if (content.hcpContents) {
      hcpCont.elements = content.hcpContents;
      hcpCont.selected =
        content.hcpContents && content.hcpContents.map(ele => ele.id);
    } else {
      hcpCont.elements = [];
      hcpCont.selected = [];
    }
    return [hcpCont];
  }
  getTeamTags(content) {
    const teamCont = new AccessRules('Team', AccessRulesAssociation.na);
    if (content.teamContents) {
      teamCont.elements = content.teamContents;
      teamCont.selected =
        content.teamContents && content.teamContents.map(ele => ele.id);
    } else {
      teamCont.elements = [];
      teamCont.selected = [];
    }
    return [teamCont];
  }
  getListImg(resp) {
    const assetInfo = {
      listImg: '',
      fileIcon: '',
      isDownloadable: false,
    };
    switch (resp.fileType) {
      case ContentType.audio:
        assetInfo.listImg = 'playIcon';
        assetInfo.fileIcon = 'file-audio';
        assetInfo.isDownloadable = false;
        break;
      case ContentType.video:
        assetInfo.listImg = 'playIcon';
        assetInfo.fileIcon = 'file-video';
        assetInfo.isDownloadable = false;
        break;
      case ContentType.image:
        assetInfo.listImg = resp.fileUrl;
        assetInfo.fileIcon = 'file-image';
        assetInfo.isDownloadable = false;
        break;
      case ContentType.document:
        assetInfo.listImg =
          'assets/images/contents/Mimetypes-x-office-document-icon.png';
        assetInfo.fileIcon = 'file-alt';
        assetInfo.isDownloadable =
          resp.fileKey.split('.').pop() === 'pdf' ? false : true;
        break;
      default:
        assetInfo.listImg =
          'assets/images/contents/Mimetypes-x-office-document-icon.png';
        assetInfo.fileIcon = 'file';
        assetInfo.isDownloadable = true;
        break;
    }

    return assetInfo;
  }
}
