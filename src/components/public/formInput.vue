<template>
	<FormItem :label="label + ':'" :required="!disabled && required">
		<label>
			<Input
				v-model="value"
				:type="type"
				:rows="rows"
				:placeholder="label"
				:show-word-limit="type === 'textarea' && maxlength !== 0"
				:maxlength="maxlength"
				:clearable="!disabled"
				:disabled="disabled"
				@on-change="change"
			/>
		</label>
	</FormItem>
</template>

<script>
export default {
	name: 'formInput',
	model: {
		prop: 'propValue',
		event: 'change',
	},
	props: {
		rows: {
			type: Number,
			defaulf: 4,
		},
		maxlength: {
			type: [Number, String],
			default: function () {
				return '';
			},
		},
		required: {
			type: Boolean,
			default: function () {
				return true;
			},
		},
		propValue: {
			type: [String, Number, undefined],
			default: function () {
				return '';
			},
		},
		type: {
			type: String,
			default: function () {
				return 'text';
			},
		},
		disabled: {
			type: Boolean,
			default: function () {
				return this.$parent.disabled || this.$parent.$attrs.disabled || false;
			},
		},
		label: [String, Number],
	},
	watch: {
		propValue: function () {
			this.value = this.propValue;
		},
	},
	data() {
		return {
			value: '',
		};
	},
	methods: {
		change() {
			this.$emit('change', this.value);
		},
	},
};
</script>

<style scoped />
