//Module management
Core.extend(function(Core) {
	'use strict';

	var Manager = {};


	Manager = {
		//all available presets
		Presets: {
			//home: ['header', 'home', 'footer'],
			noone: []
		},

		//curent preset modules
		Current: [],

		//adds new rule in presets collection
		preset: function(presetName, ModuleCollection) {
			this.Presets[presetName] = ModuleCollection
		},

		//start preset of modules
		run: function(presetName) {
			var Preset = this.Presets[presetName],
				Proms = [],
				currents = '*' + this.Current.join('*') + '*',
				rules = '*' + Preset.join('*') + '*';

			//stop old modules
			this.Current.forEach(function(moduleName) {
				if (rules.indexOf('*' + moduleName + '*') == -1) {
					//console.info('stop ' + module)
					Core.stop(moduleName)
				}
			})

			//start new modules
			Preset.forEach(function(moduleName) {
				if (currents.indexOf('*' + moduleName + '*') == -1) {
					//console.info('start ' + module)
					Proms.push(Core.start(moduleName))
				}
			})

			//update current modules
			this.Current = Preset

			return Core.Promise.some(Proms);
		},

		//start additional module
		start: function(moduleName) {
			var resultPromise;
			resultPromise = Core.start(moduleName)
			//update current modules
			this.Current.push(moduleName)

			return resultPromise || Core.Promise();
		},

		//stop single module only if it is in currently running collection
		stop: function(moduleName) {
			var dropIndex, resultPromise;
			if (this.Current.some(function(name, i) {
				//check presense and save this index if `true`
				if (name == moduleName) {
					dropIndex = i
					return true;
				}
				return false;
			})) {
				resultPromise = Core.start(moduleName)
				//update current modules
				this.Current.splice(dropIndex, 1)
			}

			return resultPromise || Core.Promise();
		}
	}

	return {
		ModuleManager: Manager
	}
})

