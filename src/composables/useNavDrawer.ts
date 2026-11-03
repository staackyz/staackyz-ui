import { ref } from 'vue';

// Module state because the top bar opens it and the drawer lives beside it, with nobody above to hold it
const open = ref(false);

export function useNavDrawer() {
    return {
        open,
        show: () => (open.value = true),
        close: () => (open.value = false),
    };
}
