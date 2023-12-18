<template>
    <div class="rightContent">
        <div class="rightContentMain">
            <router-view :key="$route.fullPath"></router-view>
        </div>
    </div>
</template>

<script setup>
    
</script>

<style scoped>
.rightContent{
    height:700px;
    width:872px;
    float:left;
    background-color: rgb(245,245,245);
}
</style>