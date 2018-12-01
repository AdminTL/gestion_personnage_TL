import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';

import {AlertService} from '@app/_services/alert.service';
import {Home, LarpemModel, Menu, Organization} from '@app/_models';

@Injectable({providedIn: 'root'})
export class LarpemService {
  private configUrl = "assets/demo.json";

  private currentMenuSubject: BehaviorSubject<Menu>;
  public currentMenu: Observable<Menu>;

  private currentHomeSubject: BehaviorSubject<Home>;
  public currentHome: Observable<Home>;

  private currentOrganizationSubject: BehaviorSubject<Organization>;
  public currentOrganization: Observable<Organization>;

  constructor(private http: HttpClient, private alertService: AlertService) {
    this.currentMenuSubject = new BehaviorSubject<Menu>(JSON.parse(localStorage.getItem('modelMenu')));
    this.currentMenu = this.currentMenuSubject.asObservable();

    this.currentHomeSubject = new BehaviorSubject<Home>(JSON.parse(localStorage.getItem('modelHome')));
    this.currentHome = this.currentHomeSubject.asObservable();

    this.currentOrganizationSubject = new BehaviorSubject<Organization>(JSON.parse(localStorage.getItem('modelOrganization')));
    this.currentOrganization = this.currentOrganizationSubject.asObservable();

    this.fetchModel();
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

  public get currentOrganizationValue(): Organization {
    return this.currentOrganizationSubject.value;
  }

  public get isOrganizationConnected(): Organization {
    return <any>this.currentOrganizationSubject.value;
  }

  public fetchModel() {
    this.http.get(this.configUrl).subscribe(
      (data: LarpemModel) => {
        console.info("Service Larp'em fetch model - Done.");

        let menu: Menu = data.menu;
        let home: Home = data.home;
        let organization: Organization = data.organization;

        localStorage.setItem('modelMenu', JSON.stringify(menu));
        localStorage.setItem('modelHome', JSON.stringify(home));
        localStorage.setItem('modelOrganization', JSON.stringify(organization));

        this.currentMenuSubject.next(menu);
        this.currentHomeSubject.next(home);
        this.currentOrganizationSubject.next(organization);
      }, error => this.alertService.error(error));
  }


  private clearModel() {
    localStorage.removeItem('modelMenu');
    this.currentMenuSubject.next(null);

    localStorage.removeItem('modelHome');
    this.currentHomeSubject.next(null);

    localStorage.removeItem('modelOrganization');
    this.currentOrganizationSubject.next(null);
  }
}
