<template>
  <h2>Button</h2>

  <div class="code-container">
    <div class="mdf-theme--dark">
      <FormKit type="button" label="Enabled" />
      <FormKit type="button" label="Disabled" disabled />
    </div>
    <div class="mdf-theme--light">
      <FormKit type="button" label="Enabled" />
      <FormKit type="button" label="Disabled" disabled />
    </div>
  </div>

  <h2>Text field</h2>

  <div class="code-container">
    <div class="mdf-theme--dark">
      <FormKit type="text" label="Enabled" help="help text" validation="required">
        <template #prefix>$</template>
        <template #suffix>lbs</template>
      </FormKit>
      <FormKit type="text" label="Disabled" value="foo" help="help text" disabled />
    </div>
    <div class="mdf-theme--light">
      <FormKit type="text" label="Enabled" help="help text" />
      <FormKit type="text" label="Disabled" help="help text" disabled />
    </div>
  </div>
</template>

<style scoped>
h2 {
  font-size: 4.5em;
  font-weight: 500;
}

.code-container {
  border: 1px solid #43493e;
  border-radius: 20px;
}

.code-container>div {
  padding: 20px;
  display: grid;
  justify-items: center;
  align-items: center;
  grid-template-columns: repeat(2, 1fr);
  background-size: 25px 25px;
  background-position: -10px -10px;
}

.code-container>div:first-child {
  border-top-right-radius: inherit;
  border-top-left-radius: inherit;
}

.code-container>div:last-child {
  border-bottom-right-radius: inherit;
  border-bottom-left-radius: inherit;
}

.code-container .mdf-theme--dark {
  background-color: #2e2b33;
  background-image: radial-gradient(circle at 1px 1px, #5f5b61 1px, transparent 0);
}

.code-container .mdf-theme--light {
  background-color: #fffbfe;
  background-image: radial-gradient(circle at 1px 1px, #cac7cb 1px, transparent 0);
}
</style>
