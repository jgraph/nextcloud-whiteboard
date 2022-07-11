/**
 *
 * @author Pawel Rojek <pawel at pawelrojek.com>
 * @author Ian Reinhart Geiser <igeiser at devonit.com>
 *
 * This file is licensed under the Affero General Public License version 3 or later.
 *
 **/

 (function (OCA) {

    OCA.DrawioWhiteboard = _.extend({}, OCA.DrawioWhiteboard);

    OCA.AppSettings = null;
    OCA.DrawioWhiteboard.Mimes = [];

    if (!OCA.DrawioWhiteboard.AppName) {
        OCA.DrawioWhiteboard = {
            AppName: "drawiowhiteboard",
            frameSelector: null
        };
    }


    OCA.DrawioWhiteboard.OpenEditor = function (fileId, filePath) {
        var url = OC.generateUrl("/apps/" + OCA.DrawioWhiteboard.AppName + "/{fileId}", {
            fileId: fileId
        });
        window.location.href = url;
    };


    OCA.DrawioWhiteboard.GetSettings = function (callbackSettings) {
        if (OCA.DrawioWhiteboard.Mimes) {
            callbackSettings();
        } else {

           var url = OC.generateUrl("apps/" + OCA.DrawioWhiteboard.AppName + "/ajax/settings");

           fetch( url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest"
                },
                credentials: 'same-origin'
            })
            .then(

              function(response) {
              if (response.status !== 200) {
                 console.log('Fetch error. Status Code: ' + response.status);
                 return;
              }

              response.json().then(function(data) {
                 OCA.AppSettings = data.settings;
                 OCA.DrawioWhiteboard.Mimes = data.formats;
                 callbackSettings();
              });
            }
          )
          .catch(function(err) {
            console.log('Fetch Error: ', err);
          });

        }
    };

    OCA.DrawioWhiteboard.FileList = {
        attach: function (fileList) {
            if (fileList.id == "trashbin") {
                return;
            }

            var registerfunc = function () {

                if (typeof(OCA.DrawioWhiteboard.Mimes) != "object") return;

                for (const ext in OCA.DrawioWhiteboard.Mimes) {
                    attr = OCA.DrawioWhiteboard.Mimes[ext];
                    fileList.fileActions.registerAction({
                        name: "drawioWBOpen",
                        displayName: t(OCA.DrawioWhiteboard.AppName, "Open in Whiteboard"),
                                       mime: attr.mime,
                                       permissions: OC.PERMISSION_READ | OC.PERMISSION_UPDATE,
                                       icon: function () {
                                            return OC.imagePath(OCA.DrawioWhiteboard.AppName, "btn-edit");
                                       },
                                       iconClass: "icon-drawio-xml",
                                       actionHandler: function (fileName, context) {
                                           var fileInfoModel = context.fileInfoModel || context.fileList.getModelForFile(fileName);
                                           OCA.DrawioWhiteboard.OpenEditor(fileInfoModel.id, OC.joinPaths(context.dir, fileName));
                                       }
                    });

                    if(attr.mime == "application/vnd.jgraph.mxfile") {
                        fileList.fileActions.setDefault(attr.mime, "drawioWBOpen");
                    }
                }
            };

            OCA.DrawioWhiteboard.GetSettings(registerfunc);
        }
    };

    OCA.DrawioWhiteboard.CreateNewFile = function (name, fileList) {
        var dir = fileList.getCurrentDirectory();

        var postData = "name="+encodeURIComponent(name)+"&dir="+encodeURIComponent(dir);

        var url = OC.generateUrl("apps/" + OCA.DrawioWhiteboard.AppName + "/ajax/new");

        fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    "X-Requested-With": "XMLHttpRequest"
                },
                credentials: 'same-origin',
                body: postData
            })
            .then(

              function(response) {
              if (response.status !== 200) {
                 console.log('Fetch error. Status Code: ' + response.status);
                 return;
              }

              response.json().then(function(data) {
                 fileList.add(data, { animate: true });
                 OCA.DrawioWhiteboard.OpenEditor( data.id, OC.joinPaths(dir, data.name) );
              });
            }
          )
          .catch(function(err) {
            console.log('Fetch Error: ', err);
          });
    };

    OCA.DrawioWhiteboard.NewFileMenu = {
        attach: function (menu) {
            var fileList = menu.fileList;

            if (fileList.id !== "files") {
                return;
            }

            var newfilefunc = function () {
                menu.addMenuEntry({
                    id: "drawioWBDiagram",
                    displayName: t(OCA.DrawioWhiteboard.AppName, "New Whiteboard"),
                                  templateName: t(OCA.DrawioWhiteboard.AppName, "New Whiteboard.drawio.wb"),
                                  iconClass: "icon-drawio-new-xml", //fileType: "application/vnd.jgraph.mxfile",
                                  fileType: "drawiowhiteboard",
                                  actionHandler: function (fileName) {
                                      OCA.DrawioWhiteboard.CreateNewFile(fileName, fileList);
                                  }
                });
           };

           OCA.DrawioWhiteboard.GetSettings(newfilefunc);
        }
    };



    OCA.DrawioWhiteboard.SidebarPreview = {

          attach: function (manager) {
            manager.addPreviewHandler('application/vnd.jgraph.mxfile', this.handlePreview.bind(this));
          },

          handlePreview: function (model, $thumbnailDiv, $thumbnailContainer, fallback) {
            var previewWidth = Math.floor($thumbnailContainer.parent().width() + 50);  // 50px for negative margins
            var previewHeight = Math.floor(previewWidth / (16 / 9));

            //[TODO]

            //var downloadUrl = Files.getDownloadUrl(model.get('name'), model.get('path'));

            //var viewer = OC.generateUrl('/apps/drawio/?minmode=true&file={file}', {file: downloadUrl});
            //var $iframe = $('<iframe id="iframeDrawioWB-sidebar" style="width:100%;height:' + previewHeight + 'px;display:block;" src="' + viewer + '" sandbox="allow-scripts allow-same-origin allow-popups allow-modals" />');
            //$thumbnailDiv.append($iframe);

            //$iframe.on('load', function() {
            //  $thumbnailDiv.removeClass('icon-loading icon-32');
            //  $thumbnailContainer.addClass('large');
            //  $thumbnailDiv.children('.stretcher').remove();
            //  $thumbnailContainer.css("max-height", previewHeight);
            //});
          },

          getFileContent: function (path) {
            return $.get(OC.linkToRemoteBase('files' + path));
          }

    };



    var getFileExtension = function (fileName) {
        var extension = fileName.substr(fileName.lastIndexOf(".") + 1).toLowerCase();
        return extension;
    };



    var initPage = function () {


        if ($("#isPublic").val() === "1" && !$("#filestable").length) {
            var fileName = $("#filename").val();
            var mimeType = $("#mimetype").val();
            var extension = getFileExtension(fileName);

            var initSharedButton = function() {
                var formats = OCA.DrawioWhiteboard.Mimes;

                var config = formats[extension];
                if (!config) {
                    return;
                }

                var button = document.createElement("a");
                button.href = OC.generateUrl("apps/" + OCA.DrawioWhiteboard.AppName + "/s/" + encodeURIComponent($("#sharingToken").val()));
                button.className = "button";
                button.innerText = t(OCA.DrawioWhiteboard.AppName, "Open in Whiteboard")

                //if (!OCA.DrawioWhiteboard.setting.sameTab) {
                //    button.target = "_blank";
                //}

                $("#preview").append(button);
            };

            OCA.DrawioWhiteboard.GetSettings(initSharedButton);
        } else {
    	    OC.Plugins.register("OCA.Files.FileList", OCA.DrawioWhiteboard.FileList);
    	    OC.Plugins.register("OCA.Files.NewFileMenu", OCA.DrawioWhiteboard.NewFileMenu);
          OC.Plugins.register('OCA.Files.SidebarPreviewManager', OCA.DrawioWhiteboard.SidebarPreview);
        }

    };

    initPage();

})(OCA);

/*
 * A little bit of a hack - changing file icon...
 */
$(document)
.ready(function () {

    PluginDrawioWB_ChangeIconsNative = function () {
        $("#filestable").find("tr[data-type=file]").each(function () {
            if (($(this).attr("data-mime") == "application/vnd.jgraph.mxfile") && ($(this).find("div.thumbnail").length > 0)) {
                if ($(this).find("div.thumbnail").hasClass("icon-drawio-xml") == false) {
                        $(this).find("div.thumbnail").addClass("icon icon-drawio-xml");
                    }
                }
        });
    };

    if ($('#filesApp').val()) {
        $('#app-content-files')
        .add('#app-content-extstoragemounts')
        .on('changeDirectory', function (e) {
            if (OCA.AppSettings == null) return;
            PluginDrawioWB_ChangeIconsNative();
        })
        .on('fileActionsReady', function (e) {
            if (OCA.AppSettings == null) return;
            PluginDrawioWB_ChangeIconsNative();
        });
        }
});
