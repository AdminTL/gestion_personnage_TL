import { Component, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';

@Component({
  selector: 'app-lore',
  templateUrl: './lore.component.html',
  styleUrls: ['./lore.component.css']
})
export class LoreComponent implements OnInit {

  lore = null;
  in_filter_edition = false;
  advance_option = false;
  _lst_unique_anchor = [];
  filter_list = [];

  constructor(private http: Http) {  }

  ngOnInit() {
    this.http.get('/cmd/lore')
    .subscribe(response => {
      this.lore = response.json().lore;
      const key = '/filter=';
      const locationHeader: string = response.headers['location'];
      if (locationHeader.substring(0, key.length) === key) {
        this.filter_list = locationHeader.substring(key.length).split('&');
        this.select_all_filter(this.filter_list);
      } else {
        this.select_all(true);
      }

      // remove first "/" of path
      const hash = locationHeader.substring(1);
      // TODO scroll to anchor

      // TODO redo this...
      // bootstrap_doc_sidebar
      /*$('body').scrollspy({
        target: '.bs-docs-sidebar',
        offset: 40
      });
      $('#sidebar').affix({
        offset: {
          top: 60
        }
      });*/
    });
  }

  isMobile(): boolean {
    return false;
    // return $scope.$parent.active_style == 'Petite personne';
  }

  formatMenuNavHtml(title: string): string {
    return title + ' <b class="caret" />';
  }

  formatAnchor(obj, lst_obj_parent): string {
    // TODO this function only work in serial process when validate unique anchor name
    if (obj === undefined || obj === null) {
      return '';
    }
    if (obj.titleAnchor !== undefined && obj.titleAnchor !== null && obj.titleAnchor !== '') {
      return obj.titleAnchor;
    }

    let anchor = '';
    if (lst_obj_parent) {
      for (let ptr = 0; ptr < lst_obj_parent.length; ptr++) {
        anchor += lst_obj_parent[ptr].title.replace(/\s+/g, '') + '_';
      }
    }
    anchor += obj.title.replace(/\s+/g, '');

    obj.titleAnchor = anchor;
    return anchor;
  }

  getTitleHtml(obj) {
    let resp;
    if ('title_html' in obj) {
      resp = obj['title_html'];
    } else {
      resp = obj['title'];
    }
    return resp;
  }

  formatHtmlDescription(desc) {
    // todo can use recursivity to simplify html creation
    // format html from string or array
    let response;
    if (Object.prototype.toString.call(desc) === '[object Array]') {
      // each item from string is a paragraph
      response = '';

      for (let i = 0; i < desc.length; i++) {
        const desc_item = desc[i];
        if (typeof desc_item === 'string') {
          response += '<p>' + desc_item + '</p>';
        } else if (Object.prototype.toString.call(desc_item) === '[object Array]') {
          // each array in array is bullet list
          response += '<ul>';
          for (let j = 0; j < desc_item.length; j++) {
            const bullet_item = desc_item[j];
            if (Object.prototype.toString.call(bullet_item) === '[object Array]') {
              response += '<ul>';
              // array in bullet is bullet level 2
              for (let k = 0; k < bullet_item.length; k++) {
                response += '<li>' + bullet_item[k] + '</li>';
              }
              response += '</ul>';
            } else {
              response += '<li>' + bullet_item + '</li>';
            }
          }
          response += '</ul>';
        } else if (Object.prototype.toString.call(desc_item) === '[object Object]') {
          if (desc_item.type !== undefined && desc_item.type !== null && desc_item.type !== '') {
            if (desc_item.type === 'image' && desc_item.src !== undefined && desc_item.src !== null && desc_item !== '') {
              response += '<img src="' + desc_item.src +
              '" style="max-width: 100%; height: auto; display: block;" class="img-responsive img-thumbnail" alt="Responsive image">';
            }
          }
        }
      }
    } else {
      response = desc;
    }
    return response;
  }

  select_all(is_selected: boolean) {
    // prepare data
    for (let i1 = 0; i1 < this.lore.length; i1++) {
      const sec1 = this.lore[i1];
      sec1.visible = is_selected;
      if (sec1.section) {
        for (let i2 = 0; i2 < sec1.section.length; i2++) {
          const sec2 = sec1.section[i2];
          sec2.visible = is_selected;
          if (sec2.section) {
            for (let i3 = 0; i3 < sec2.section.length; i3++) {
              const sec3 = sec2.section[i3];
              sec3.visible = is_selected;
              if (sec3.section) {
                for (let i4 = 0; i4 < sec3.section.length; i4++) {
                  const sec4 = sec3.section[i4];
                  sec4.visible = is_selected;
                  if (sec4.section) {
                    for (let i5 = 0; i5 < sec4.section.length; i5++) {
                      const sec5 = sec4.section[i5];
                      sec5.visible = is_selected;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  select_all_filter(filter_list) {
    // prepare data
    for (let i1 = 0; i1 < this.lore.length; i1++) {
      const sec1 = this.lore[i1];
      sec1.visible = filter_list.indexOf(this.formatAnchor(sec1, null)) >= 0;
      if (sec1.section) {
        for (let i2 = 0; i2 < sec1.section.length; i2++) {
          const sec2 = sec1.section[i2];
          sec2.visible = filter_list.indexOf(this.formatAnchor(sec2, [sec1])) >= 0;
          if (sec2.section) {
            for (let i3 = 0; i3 < sec2.section.length; i3++) {
              const sec3 = sec2.section[i3];
              sec3.visible = filter_list.indexOf(this.formatAnchor(sec3, [sec1, sec2])) >= 0;
              if (sec3.section) {
                for (let i4 = 0; i4 < sec3.section.length; i4++) {
                  const sec4 = sec3.section[i4];
                  sec4.visible = filter_list.indexOf(this.formatAnchor(sec4, [sec1, sec2, sec3])) >= 0;
                  if (sec4.section) {
                    for (let i5 = 0; i5 < sec4.section.length; i5++) {
                      const sec5 = sec4.section[i5];
                      sec5.visible = filter_list.indexOf(this.formatAnchor(sec5, [sec1, sec2, sec3, sec4])) >= 0;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  change_location_filter() {
    if (!this.lore) {
      return '';
    }
    this.filter_list = [];

    // detect visible
    for (let i1 = 0; i1 < this.lore.length; i1++) {
      const sec1 = this.lore[i1];
      if (sec1.visible) {
        this.filter_list.push(sec1.titleAnchor);
      }
      if (sec1.section) {
        for (let i2 = 0; i2 < sec1.section.length; i2++) {
          const sec2 = sec1.section[i2];
          if (sec2.visible) {
            this.filter_list.push(sec2.titleAnchor);
          }
          if (sec2.section) {
            for (let i3 = 0; i3 < sec2.section.length; i3++) {
              const sec3 = sec2.section[i3];
              if (sec3.visible) {
                this.filter_list.push(sec3.titleAnchor);
              }
              if (sec3.section) {
                for (let i4 = 0; i4 < sec3.section.length; i4++) {
                  const sec4 = sec3.section[i4];
                  if (sec4.visible) {
                    this.filter_list.push(sec4.titleAnchor);
                  }
                  if (sec4.section) {
                    for (let i5 = 0; i5 < sec4.section.length; i5++) {
                      const sec5 = sec4.section[i5];
                      if (sec5.visible) {
                        this.filter_list.push(sec5.titleAnchor);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return 'TODO https://stackoverflow.com/questions/36101756/angular2-routing-with-hashtag-to-page-anchor';
    // return $window.location.origin + '/lore#/filter=' + this.filter_list.join('&');
  }

  class_color_level(section) {
    // under_level_color is generated from tl_rule.json
    return section.under_level_color;
  }
}
