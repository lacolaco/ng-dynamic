import 'core-js/shim';
import 'zone.js/dist/zone';

import {platformBrowser} from '@angular/platform-browser';
import {COMPILER_PROVIDERS} from '@angular/compiler';
import {AppModuleNgFactory} from './app.module.ngfactory';

platformBrowser([
    ...COMPILER_PROVIDERS,
]).bootstrapModuleFactory(AppModuleNgFactory);