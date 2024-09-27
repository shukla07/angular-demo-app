function issueCollectorScriptCode(collectorUrl, jQuery, args) {
  jQuery.ajax({
    url: collectorUrl,
    type: 'get',
    cache: true,
    dataType: 'script',
  });
  window.ATL_JQ_PAGE_PROPS = jQuery.extend(window.ATL_JQ_PAGE_PROPS, {
    fieldValues: {
      description:
        args.environment +
        '\n --------------------------- \n **WRITE YOUR DESCRIPTION HERE**',
      priority: '3',
    },
  });
}
function jiraIssueCollector(url, jQuery) {
  if (typeof jQuery === 'undefined') {
    return;
  }
  if (window.FS) {
    window['_fs_ready'] = function () {
      const sessionUrl = window.FS.getCurrentSessionURL();
      issueCollectorScriptCode(url, jQuery, {
        environment: '*FullStoryUrl:* ' + sessionUrl,
      });
    };
  } else {
    issueCollectorScriptCode(url, jQuery);
  }
}
$(document).ready(function () {
  const url =
    'https://sourcefuse.atlassian.net/s/d41d8cd98f00b204e9800998ecf8427e-T/-egccmf/b/24/a44af77267a987a660377e5c46e0fb64/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector.js?locale=en-US&collectorId=4beeedfd';
  jiraIssueCollector(url, $);
});
