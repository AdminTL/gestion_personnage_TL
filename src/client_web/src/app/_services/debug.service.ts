import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {DebugView} from '@app/_models';

@Injectable({providedIn: 'root'})
export class DebugService {
  private debugViewSubject: BehaviorSubject<DebugView>;
  public debugView: Observable<DebugView>;


  constructor(private http: HttpClient) {
    this.debugViewSubject = new BehaviorSubject<DebugView>(JSON.parse(localStorage.getItem('debugView')));
    this.debugView = this.debugViewSubject.asObservable();
  }

  public fetchDebugServer(): void {
    // TODO complete me with server side!
    let debugView = new DebugView();
    debugView.enabled = false;

    localStorage.setItem('debugView', JSON.stringify(debugView));
    this.debugViewSubject.next(debugView)
  }

  public get debugViewValue(): DebugView {
    return this.debugViewSubject.value;
  }

  public set debugViewValue(debugView: DebugView) {
    this.debugViewSubject.next(debugView);
  }

  public toggleDebug(): void {
    console.debug(this.debugViewSubject.value.enabled);
    let debugView = new DebugView();
    debugView.enabled != this.debugViewSubject.value.enabled;

    localStorage.setItem('debugView', JSON.stringify(debugView));
    this.debugViewSubject.next(debugView)
  }
}
