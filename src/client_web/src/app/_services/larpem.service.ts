import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of} from 'rxjs';

import {AlertService} from '@app/_services/alert.service';
import {Document, Home, LarpemModel, Manual, Menu, Organization} from '@app/_models';
import {environment} from "@environments/environment";

@Injectable({providedIn: 'root'})
export class LarpemService {
  private localDemoURL = "assets/demo.json";
  private remoteURL = `${environment.apiUrl}/cmd/model/`;

  private currentMenuSubject: BehaviorSubject<Menu>;
  public currentMenu: Observable<Menu>;

  private currentHomeSubject: BehaviorSubject<Home>;
  public currentHome: Observable<Home>;

  private currentOrganizationSubject: BehaviorSubject<Organization>;
  public currentOrganization: Observable<Organization>;

  private currentManualSubject: BehaviorSubject<Manual>;
  public currentManual: Observable<Manual>;

  constructor(private http: HttpClient, private alertService: AlertService) {
    this.currentMenuSubject = new BehaviorSubject<Menu>(JSON.parse(localStorage.getItem('modelMenu')));
    this.currentMenu = this.currentMenuSubject.asObservable();

    this.currentHomeSubject = new BehaviorSubject<Home>(JSON.parse(localStorage.getItem('modelHome')));
    this.currentHome = this.currentHomeSubject.asObservable();

    this.currentOrganizationSubject = new BehaviorSubject<Organization>(JSON.parse(localStorage.getItem('modelOrganization')));
    this.currentOrganization = this.currentOrganizationSubject.asObservable();

    this.currentManualSubject = new BehaviorSubject<Manual>(JSON.parse(localStorage.getItem('modelManual')));
    this.currentManual = this.currentManualSubject.asObservable();

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

  public get currentManualValue(): Manual {
    return this.currentManualSubject.value;
  }

  public get isManualConnected(): Manual {
    return <any>this.currentManualSubject.value;
  }

  public getManualDocument(documentName: string): Document {
    if (this.currentManualSubject.value) {
      for (let document of this.currentManualSubject.value.documents) {
        if (document.name == documentName) {
          return document;
        }
      }
    }
    return null;
  }

  public getDocumentId(documentName: string): Number {
    if (this.currentManualSubject.value) {
      let i = 0;
      for (let document of this.currentManualSubject.value.documents) {
        if (document.name == documentName) {
          return i;
        }
        i++;
      }
    }
    return -1;
  }

  public getDocuments(): Observable<Document[]> {
    return of(this.currentManualSubject.value.documents);
  }


  public fetchModel() {
    let url: string = environment.useLocalDemoData ? this.localDemoURL : this.remoteURL;
    this.http.get(url).subscribe(
      (data: LarpemModel) => {
        console.info("Service Larp'em fetch model - Done.");
        console.debug(data);

        let menu: Menu = data.menu;
        let home: Home = data.home;
        let organization: Organization = data.organization;
        let manual: Manual = data.manual;

        localStorage.setItem('modelMenu', JSON.stringify(menu));
        localStorage.setItem('modelHome', JSON.stringify(home));
        localStorage.setItem('modelOrganization', JSON.stringify(organization));
        localStorage.setItem('modelManual', JSON.stringify(manual));

        this.currentMenuSubject.next(menu);
        this.currentHomeSubject.next(home);
        this.currentOrganizationSubject.next(organization);
        this.currentManualSubject.next(manual);

        console.debug(menu);
        console.debug(home);
        console.debug(organization);
        console.debug(manual);
      }, error => this.alertService.error(error));
  }

  private clearModel() {
    localStorage.removeItem('modelMenu');
    this.currentMenuSubject.next(null);

    localStorage.removeItem('modelHome');
    this.currentHomeSubject.next(null);

    localStorage.removeItem('modelOrganization');
    this.currentOrganizationSubject.next(null);

    localStorage.removeItem('modelManual');
    this.currentManualSubject.next(null);
  }
}
