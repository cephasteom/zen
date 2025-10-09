<script lang="ts">
    import { meetingId, isCollaborating } from "$lib/stores/collaborative-editing";    
  import Checkbox from "$lib/components/core/Checkbox.svelte";
</script>

<div class="collaborate">
    <form>
        <div>
            <p>Share or enter a meeting ID, then turn collaboration on. Starting or joining a session will override your current code. Please back up your work before proceeding.</p>
        </div>
        <div>
            <label
                for="meetingId"
            >ID</label>
            <input 
                type="text" 
                placeholder="Meeting ID" 
                name="meetingId"
                bind:value={$meetingId} 
                disabled={$isCollaborating}
            />
        </div>
        <div>
            <Checkbox 
                id="toggleCollaboration"
                label="Collaborate"
                bind:checked={$isCollaborating}
            />
        </div>
    </form>
</div>

<style lang="scss">
    .collaborate {
        padding: 1rem 2rem;
    }
    p {
        margin: 0;
    }
    div {
        margin-bottom: 1rem;
        &:last-child {
            margin-bottom: 0;
        }
    }
    label {
        padding-right: 0.125rem;
        color: var(--color-grey-light);
    }
    input[type="checkbox"] {
        transform: scale(1.5) translateY(-0.05rem);
        // margin-left: 0.5rem;
        vertical-align: middle;
        border: none;
    }

</style>