import { AfterViewInit, Compiler, Component, Injector, NgModule, NgModuleRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-toolset',
  template: `
    <ng-container #dynamicTemplate></ng-container>
  `,
  styleUrls: ['./toolset.component.scss']
})
export class ToolsetComponent implements AfterViewInit, OnInit {
  @ViewChild('dynamicTemplate', {read: ViewContainerRef}) dynamicTemplate;

  constructor(private compiler: Compiler,
              private injector: Injector,
              private moduleRef: NgModuleRef<any>) {
  }

  ngAfterViewInit() {
    const tmpCmp = Component({
      moduleId: '',
      template: '<div>hello</div>'
    })(class {
    });
    const tmpModule = NgModule({declarations: [tmpCmp]})(class {
    });

    this.compiler.compileModuleAndAllComponentsAsync(tmpModule)
      .then((factories) => {
        const f = factories.componentFactories[0];
        const cmpRef = f.create(this.injector, [], null, this.moduleRef);
        cmpRef.instance.name = 'dynamic';
        this.dynamicTemplate.insert(cmpRef.hostView);
      });
  }

  ngOnInit(): void {
  }
}
