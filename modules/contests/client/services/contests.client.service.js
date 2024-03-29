'use strict';

//Contests service used for communicating with the contests REST endpoints
angular.module('contests').factory('Contests', ['$resource',
  function ($resource) {
    return $resource('api/contests/:contestId', {
      contestId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

// Export the tabel into excel
angular.module('contests').factory('Excel', ['$resource', '$window',
  function ($resource, $window) {
    var uri='data:application/vnd.ms-excel;base64,',
        template='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
        base64=function(s){return $window.btoa(window.unescape(encodeURIComponent(s)));},
        format=function(s,c){return s.replace(/{(\w+)}/g,function(m,p){return c[p];});};
    return {
        tableToExcel:function(tableId,worksheetName){
            var table=$window(tableId),
                ctx={worksheet:worksheetName,table:table.html()},
                href=uri+base64(format(template,ctx));
            return href;
        }
    };
  }
]);

