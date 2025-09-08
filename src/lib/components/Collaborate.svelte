<script lang="ts">
    import { meetingId, isCollaborating } from "$lib/stores/collaborative-editing";    
</script>

<div class="collaborate">
    <form>
        <div>
            <p>Share or enter a meeting ID, then turn collaboration on. Starting or joining a session will override your current code. Please back up your work before proceeding.</p>
        </div>
        <div>
            <label
                for="meetingId"
            >Meeting ID</label>
            <input 
                type="text" 
                placeholder="Meeting ID" 
                name="meetingId"
                bind:value={$meetingId} 
            />
        </div>
        <div>
            <label for="toggleCollaboration">Collaborate</label>
            <input 
                type="checkbox" 
                name="toggleCollaboration" 
            id="toggleCollaboration"
            bind:checked={$isCollaborating}
        />
        </div>

    </form>
</div>

<style lang="scss">
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