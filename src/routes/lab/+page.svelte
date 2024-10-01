<script lang="ts">
	import 'bpmn-js/dist/assets/diagram-js.css';
	import 'bpmn-js/dist/assets/bpmn-js.css';

	import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
	import '@bpmn-io/properties-panel/assets/properties-panel.css';

	import BpmnModeler from 'bpmn-js/lib/Modeler';
	import {
		BpmnPropertiesPanelModule,
		BpmnPropertiesProviderModule
	} from 'bpmn-js-properties-panel';
</script>

<div>
	<div class="content with-diagram" id="js-drop-zone">
		<div class="message intro">
			<div class="note">
				Drop BPMN diagram from your desktop or <a id="js-create-diagram" href
					>create a new diagram</a
				> to get started.
			</div>
		</div>

		<div class="message error">
			<div class="note">
				<p>Ooops, we could not display the BPMN 2.0 diagram.</p>

				<div class="details">
					<span>Import Error Details</span>
					<pre></pre>
				</div>
			</div>
		</div>

		<div class="canvas" id="js-canvas"></div>
		<div class="properties-panel-parent" id="js-properties-panel"></div>
	</div>
</div>
