import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';

import {AlertService} from '@app/_services/alert.service';
import {Home, LarpemModel, Menu} from '@app/_models';

@Injectable({providedIn: 'root'})
export class LarpemService  {
  private configUrl = "assets/demo.json";

  private currentMenuSubject: BehaviorSubject<Menu>;
  public currentMenu: Observable<Menu>;

  private currentHomeSubject: BehaviorSubject<Home>;
  public currentHome: Observable<Home>;

  constructor(private http: HttpClient, private alertService: AlertService) {
    this.currentMenuSubject = new BehaviorSubject<Menu>(JSON.parse(localStorage.getItem('modelMenu')));
    this.currentMenu = this.currentMenuSubject.asObservable();

    this.currentHomeSubject = new BehaviorSubject<Home>(JSON.parse(localStorage.getItem('modelHome')));
    this.currentHome = this.currentHomeSubject.asObservable();

    this.fetch_model();
  }

  public get currentMenuValue(): Menu {
    return this.currentMenuSubject.value;
  }

  public get isMenuConnected(): Menu {
    return <any>this.currentMenuSubject.value;
  }

  public get currentHomeValue(): Home {
    return this.currentHomeSubject.value;
  }

  public get isHomeConnected(): Home {
    return <any>this.currentHomeSubject.value;
  }

  public fetch_model() {
    this.http.get(this.configUrl).subscribe(
      (data: LarpemModel) => {
        console.info("Service Larp'em fetch model - Done.");

        let menu:Menu = data.menu;
        let home:Home = data.home;

        localStorage.setItem('modelMenu', JSON.stringify(menu));
        localStorage.setItem('modelHome', JSON.stringify(home));

        this.currentMenuSubject.next(menu);
        this.currentHomeSubject.next(home);
      }, error => this.alertService.error(error));
  }


  delete() {
    // remove Menu from local storage to log Menu out
    localStorage.removeItem('modelMenu');
    this.currentMenuSubject.next(null);
  }
}
