import { type BaseEvent } from '@react-types/shared'
import {
  useCombobox,
  type UseComboboxStateChangeOptions,
  type UseComboboxState,
  type UseComboboxStateChange,
} from 'downshift'
import { type KeyboardEvent, useRef, useState } from 'react'
import { FzfHighlight, useFzf } from 'react-fzf'
import {
  type Control,
  useController,
  type FieldValues,
  type FieldPath,
  type PathValue,
  type Path,
  type ValidateResult,
} from 'react-hook-form'
import { RiArrowDownSLine } from 'react-icons/ri'

import { Button } from 'components/form/Button'
import { ControlMenu } from 'components/form/ControlMenu'
import { Label } from 'components/form/Label'
import { TextInput } from 'components/form/TextInput'
import { Flex } from 'components/ui/Flex'
import { Icon } from 'components/ui/Icon'
import { Spinner } from 'components/ui/Spinner'
import { clst } from 'styles/clst'

export const Combobox = <TItem, TFormFields extends FieldValues>({
  control,
  defaultItem,
  disabled,
  enterKeyHint,
  errorMessage,
  items,
  itemToMenuItem,
  itemToString,
  label,
  loading,
  name,
}: ComboboxProps<TItem, TFormFields>) => {
  const container = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')

  const { getFzfHighlightProps, results } = useFzf({
    items: items,
    itemToString: itemToMenuItem ?? itemToString,
    query,
  })

  const {
    field: { onChange, value },
  } = useController<TFormFields>({
    control,
    // https://github.com/react-hook-form/react-hook-form/issues/2978#issuecomment-1001992272
    defaultValue: defaultItem as PathValue<TFormFields, Path<TFormFields>>,
    name,
    rules: { validate },
  })

  const { getInputProps, getItemProps, getLabelProps, getMenuProps, getToggleButtonProps, highlightedIndex, isOpen } =
    useCombobox({
      initialSelectedItem: value,
      items: results,
      itemToString,
      onSelectedItemChange: handleSelectedItemChange,
      stateReducer,
    })

  const inputProps = getInputProps({
    onKeyDown(event) {
      if (event.key === 'Escape' && !isOpen && isContinuableEvent(event)) {
        event.nativeEvent.preventDownshiftDefault = true
        event.continuePropagation()
      }
    },
  })

  function handleSelectedItemChange(changes: UseComboboxStateChange<TItem>) {
    onChange(changes.selectedItem)
  }

  function stateReducer(state: UseComboboxState<TItem>, { type, changes }: UseComboboxStateChangeOptions<TItem>) {
    switch (type) {
      case useCombobox.stateChangeTypes.InputChange: {
        setQuery(changes.inputValue ?? '')

        return changes
      }
      case useCombobox.stateChangeTypes.ItemClick:
      case useCombobox.stateChangeTypes.InputKeyDownEnter: {
        return {
          ...changes,
          inputValue: itemToString(changes.selectedItem),
        }
      }
      case useCombobox.stateChangeTypes.InputKeyDownEscape:
      case useCombobox.stateChangeTypes.ToggleButtonClick:
      case useCombobox.stateChangeTypes.InputBlur: {
        if (type === useCombobox.stateChangeTypes.ToggleButtonClick && !isOpen) {
          return changes
        }

        return {
          ...changes,
          inputValue: itemToString(state.selectedItem),
          isOpen: false,
          selectedItem: state.selectedItem,
        }
      }
      default: {
        return changes
      }
    }
  }

  function validate(): ValidateResult {
    return !isOpen || 'required'
  }

  function isDisabled() {
    return disabled ?? loading
  }

  const triggerIconClasses = clst('motion-safe:transition-transform motion-safe:duration-200', isOpen && 'rotate-180')

  return (
    <div className="relative mb-3" ref={container}>
      <Label {...getLabelProps({ disabled: isDisabled() })} errorMessage={errorMessage}>
        {label}
      </Label>
      <Flex className="relative">
        {loading ? <Spinner className="absolute top-1.5 right-12 h-5 w-5 text-blue-500" /> : null}
        <TextInput
          {...inputProps}
          className="mr-1.5"
          spellCheck={false}
          readOnly={isDisabled()}
          enterKeyHint={enterKeyHint}
          errorMessage={errorMessage}
          value={loading ? 'Loading…' : inputProps.value}
        />
        <Button
          {...getToggleButtonProps({
            'aria-label': 'Toggle Menu',
            className: 'min-w-0 px-2 disabled:bg-zinc-600',
            disabled: isDisabled(),
          })}
        >
          <Icon icon={RiArrowDownSLine} className={triggerIconClasses} />
        </Button>
      </Flex>
      <ControlMenu
        className="mr-9"
        container={container}
        items={results}
        itemToString={itemToMenuItem ?? itemToString}
        menuProps={getMenuProps()}
        getItemProps={getItemProps}
        highlightedIndex={highlightedIndex}
        isOpen={isOpen}
        itemRenderer={(item, isHighlighted, index) => (
          <FzfHighlight
            {...getFzfHighlightProps({ className: isHighlighted ? 'text-blue-300' : 'text-blue-400', index, item })}
          />
        )}
      />
    </div>
  )
}

function isContinuableEvent(event: KeyboardEvent | BaseEvent<KeyboardEvent>): event is ContinuableEvent {
  return typeof (event as BaseEvent<KeyboardEvent>).continuePropagation === 'function'
}

interface ComboboxProps<TItem, TFormFields extends FieldValues> {
  control: Control<TFormFields>
  defaultItem: TItem
  disabled?: boolean
  enterKeyHint?: React.ComponentPropsWithoutRef<'input'>['enterKeyHint']
  errorMessage?: string
  items: TItem[]
  itemToMenuItem?: (item: TItem | null | undefined) => string
  itemToString: (item: TItem | null | undefined) => string
  label: string
  loading?: boolean
  name: FieldPath<TFormFields>
}

type ContinuableEvent = BaseEvent<KeyboardEvent> & {
  nativeEvent: BaseEvent<KeyboardEvent>['nativeEvent'] & { preventDownshiftDefault: boolean }
}
