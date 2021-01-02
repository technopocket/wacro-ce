$(document).ready(function() {

  let loadOptionData = function () {
    let option_data = _g.getOptionData();
    for (let key in _g.default_option_data) {
      let value = option_data[key];
      if (key.indexOf('is_') != -1) {
        if (value) {
          $('#' + key)[0].parentElement.MaterialSwitch.on();
        } else {
          $('#' + key)[0].parentElement.MaterialSwitch.off();
        }
      } else {
        $('#' + key)[0].parentElement.MaterialTextfield.change(value);
      }
    }
  };

  let saveOptionData = function () {
    let option_data = {};
    for (let key in _g.default_option_data) {
      if (key.indexOf('is_') != -1) {
        option_data[key] = $('#' + key).is(':checked');
      } else {
        option_data[key] = $('#' + key).val();
      }
    }
    _g.setOptionData(option_data);
  };


  let dialog = document.querySelector('#favorite_dialog');
  dialog.querySelector('.close').addEventListener('click', function () {
    let favorite_data = {};;
    for (let key in _g.default_favorite_data) {
      if (key.indexOf('is_') != -1) {
        favorite_data[key] = $('#' + key).is(':checked');
      } else {
        favorite_data[key] = $('#' + key).val();
      }
    }
    let base_url = $('#base_url').val();
    console.log(base_url);
    _g.setFavoriteData(favorite_data, base_url);
    console.log(favorite_data);
    showFavoriteList();
    dialog.close();
  });

  let showFavoriteList = function () {
    let createListItemJqObj = function (favorite_data, sort_id=0) {
      let title = favorite_data.title == '' ? favorite_data.url : favorite_data.title;
      let jqObj = $('<li class="mdl-list__item" sort-id="'+sort_id+'">');
      //
      let nameJqObj = $('<span class="mdl-list__item-primary-content"><img class="favicon" width="24px" height="24px" src="' + favorite_data.favicon_url + '" /><span>' + title + '</span></span>');
      jqObj.append(nameJqObj);
      //
      let settingBtnJqObj = $('<button class="delete mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect"><i class="material-icons">settings</i></button>');
      settingBtnJqObj.click(() => {
        $(dialog).find('#title')[0].parentElement.MaterialTextfield.change('fadfa');
        for (let key in _g.default_favorite_data) {
          let value = favorite_data[key] ? favorite_data[key] : _g.default_favorite_data[key];
          if (key.indexOf('is_') != -1) {
            if (value) {
              $('#' + key)[0].parentElement.MaterialSwitch.on();
            } else {
              $('#' + key)[0].parentElement.MaterialSwitch.off();
            }
          } else {
            $('#' + key)[0].parentElement.MaterialTextfield.change(value);
          }
        }
        $('#base_url').val(favorite_data.url);
        dialog.showModal();
      });
      jqObj.append(settingBtnJqObj);
      //
      let starBtnJqObj = $('<button class="delete mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect"><i class="material-icons">' + (favorite_data == null ? 'star_border' : 'close') + '</i></button>');
      starBtnJqObj.click(() => {
        console.log('favorite button');
        let option_data = _g.getOptionData();
        if (favorite_data == null) {
          _g.setFavoriteData({
            favicon_url: favorite_data.favIconUrl,
            url: favorite_data.url,
            title: favorite_data.title,
            width: favorite_data.width,
            height: favorite_data.height,
          });
          showFavoriteList();
        } else {
          if (option_data.is_show_confirm_on_delete_favorite) {
            if (!confirm('Remove favorite?')) {
              return false;
            }
          }
          _g.removeFavoriteData(favorite_data.url);
          showFavoriteList();
        }
      });
      jqObj.append(starBtnJqObj);
      return jqObj;
    };
    let favorite_data_list = _g.getFavoriteDataList();
    favorite_data_list = favorite_data_list.reverse();
    $('#favorite_list').html('')
    for (var i in favorite_data_list) {
      $('#favorite_list').append(createListItemJqObj(favorite_data_list[i], i));
    }
    if (favorite_data_list.length <= 0) {
      $('#favorite_list').html('<li class="mdl-list__item"><span class="mdl-list__item-primary-content">non items</span></li>');
    }
  };

  let init = () => {
    for (let key in _g.default_option_data) {
      if (key.indexOf('is_') != -1) {
        $('#' + key).click(saveOptionData);
      } else {
        $('#' + key).change(saveOptionData);
      }
    }
  };

  $('#favorite_list').sortable({
    update: function (event, ui) {
      console.log("並び替えが実行されました");
      var sort_id_list = [];
      $('#favorite_list li').each(function (index, element) {
        sort_id_list.push($(element).attr('sort-id'));
      });
      console.log(sort_id_list);
      let favorite_data_list = _g.getFavoriteDataList();
      favorite_data_list = favorite_data_list.reverse();
      let new_favorite_data_list = [];
      for (let sort_id of sort_id_list) {
        new_favorite_data_list.push(favorite_data_list[sort_id]);
      }
      console.log(new_favorite_data_list);
      _g.setFavoriteDataList(new_favorite_data_list.reverse());
      showFavoriteList();
    }
  });

  console.log("options/script.js");
  init();
  loadOptionData();
  showFavoriteList();
});


