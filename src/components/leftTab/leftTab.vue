<template>
    <div class="leftTab">
        <div>
            <upInf></upInf>
        </div>
        <div>
            <downList></downList>
        </div>
    </div>
</template>

<script setup>
    import upInf from './upInf/upInf.vue';
    import downList from './downList/downList.vue'
</script>

<style scoped>
.leftTab{
    height:700px;
    width:68px;
    background-color:rgb(245, 245, 245);
    float:left;
}
</style>