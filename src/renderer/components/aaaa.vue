<template>
    <div>
        <div class="title">Information</div>
        <div class="items">
            <div class="item">
                <div class="name">Path:</div>
                <div class="value">111111{{ path }}</div>
            </div>
            <div class="item">
                <div class="name">Route Name:</div>
                <div class="value">{{ name }}</div>
            </div>
            <div class="item">
                <div class="name">Electron:</div>
                <div class="value">{{ electron }}</div>
            </div>
            <div class="item">
                <div class="name">Node:</div>
                <div class="value">{{ node }}</div>
            </div>
            <div class="item">
                <div class="name">Platform:</div>
                <div class="value">{{ platform }}</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "aaaa",
        data () {
            return {
                electron: process.versions['atom-shell'],
                name: this.$route.name,
                node: process.versions.node,
                path: this.$route.path,
                platform: require('os').platform(),
                vue: require('vue/package.json').version
            }
        }
    }
</script>

<style scoped>

</style>