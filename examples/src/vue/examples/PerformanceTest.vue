<script setup lang="ts">
import { ref } from 'vue'
import { FormKit } from '@formkit/vue'
import { token } from '@formkit/utils'

const didRun = ref(false)
const inputs = ref<{ key: string }[]>([])
const form = ref<typeof FormKit>()
const insideForm = ref<boolean>(true)

const results = ref<Record<string, number | number[]>>({})
const incrementalMountTimes: number[] = []

function makeInputs (total: number) {
  const fields = []
  for (let i = 0; i < total; i++) {
    fields.push({
      key: token(),
    })
  }
  return fields
}

async function testInputTime(el: HTMLInputElement, label: string) {
  var inputEvent = new Event('input', {
      bubbles: true,
      cancelable: true,
  });
  el.value = 'testing 123'
  const startTime = performance.now()
  el.dispatchEvent(inputEvent)
  await new Promise(resolve => setTimeout(resolve, 0))
  await form.value?.node.settled
  const endTime = performance.now()
  results.value = {
    ...results.value,
    [`Input settlement time (${label}${insideForm.value ? '' : ' , outside form'})`]: endTime - startTime,
  }
}

async function testIncrementally(total: number) {
  const newInputs = makeInputs(total)
  incrementalMountTimes.length = 0
  inputs.value = []
  await new Promise(resolve => setTimeout(resolve, 1000))
  async function mountNext() {
    const startTime = performance.now()
    const input = newInputs.shift()!
    inputs.value.push(input)
    await new Promise(resolve => setTimeout(resolve, 0))
    await form.value?.node.settled
    const endTime = performance.now()
    incrementalMountTimes.push(endTime - startTime)
    if (!document.getElementById(input.key)) {
      alert('input was not yet mounted.')
      return
    }
    if (newInputs.length) await mountNext()
  }
  await mountNext()
  results.value = {
    ...results.value,
    [`Input  time${insideForm.value ? '' : '(outside form)'}`]: [...incrementalMountTimes],
  }
}

async function runTest (values: { total: number, incremental_test: boolean, compare: boolean }) {
  insideForm.value = values.compare
  inputs.value = []
  await new Promise(resolve => setTimeout(resolve, 1000))
  const startTime = performance.now()
  inputs.value = makeInputs(values.total)
  if (form.value) {
    await form.value.node.settled
  }
  const endTime = performance.now()
  results.value = {
    ...results.value,
    [`Initial settlement time${insideForm.value ? '' : ' (outside form)'}`]: endTime - startTime,
  }
  const first = document.getElementById(inputs.value[0].key) as HTMLInputElement
  const last = document.getElementById(inputs.value[inputs.value.length - 1].key) as HTMLInputElement
  if (!values.compare) {
    await testInputTime(first, 'first element')
    await testInputTime(last, 'last element')
  }
  if (values.incremental_test) {
    await testIncrementally(values.total)
  }
  if (values.compare) {
    await runTest({
      total: values.total,
      incremental_test: values.incremental_test,
      compare: false,
    })
  } else {
    didRun.value = true
  }
}
</script>

<template>
  <div class="test-config">
    <FormKit
      v-if="!didRun"
      type="form"
      submit-label="Run test"
      @submit="runTest"
    >
      <FormKit
        type="number"
        name="total"
        label="Total number of inputs to render"
        value="50"
      />
      <FormKit
        type="checkbox"
        name="incremental_test"
        label="Test the mounting time for each incremental input"
        :value="true"
      />
      <FormKit
        type="checkbox"
        name="compare"
        label="Run comparison tests mounting outside a form"
        :value="true"
      />
    </FormKit>
    <div
      v-else
    >
      <h3>Test results</h3>
      <table>
        <tr
          v-for="(result, test) in results"
          :key="test"
        >
          <td>{{ test }}</td>
          <td v-if="typeof result === 'number'">
            {{ Math.round(result) }}ms
          </td>
          <td v-else>
            <div class="chart">
              <div
                v-for="(time, i) in result"
                :key="i"
                :style="{ height: `${time / Math.max(...result) * 100}%` }"
              />
            </div>
          </td>
        </tr>
      </table>
      <div>Refresh the page to run another test.</div>
    </div>
  </div>
  <FormKit
    ref="form"
    type="form"
  >
    <div class="inputs">
      <FormKit
        v-for="input in inputs"
        :id="input.key"
        :key="input.key"
        :label="`FormKit Input (${input.key})`"
        :delay="0"
        value=""
        validation="required"
        :ignore="!insideForm"
      />
    </div>
  </FormKit>
</template>


<style scoped>
.inputs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1em;
}

table {
  border-collapse: collapse;
}

td {
  border: 1px solid #ccc;
  padding: 1em;
  margin: 1em 0;
}

.test-config {
  border: 1px solid #ccc;
  padding: 1em;
  margin-bottom: 2em;
  border-radius: .25em;
}

.chart {
  display: flex;
  height: 100px;
  width: 100%;
  align-items: flex-end;
}
.chart div {
  width: 2px;
  margin-right: 1px;
  background-color: blue;
}
</style>
