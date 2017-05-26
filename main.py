# основной модуль, запускаемый

import rwFunc
import processing
import partsProcFunc
import xlrd


# считывание экселевской таблицы в переменную table
print("read table...")
table = xlrd.open_workbook("Resources\\dict.xls").sheet_by_index(0)


# основная часть, последовательность вложенных функций,
# которые последовательно осуществляют создание словаря
# подстановочных функций для каждой части речи (create_fill_args_func_dict),
# создание ридера слов для таблицы (words_reader)
# (считывает и возвращает за раз структуру, описывающее одно слово,
# структура содержит в числе прочего все его формы и информацию о них),
# создание генератора подстановочных аргументов (words_html_args_generator),
# таких как грамматические признаки, формы,
# для отдельных слов в предусмотренные для них html-шаблоны,
# создание генератора html-разметки для всех слов,
# начинающихся с одной буквы (letters_html_generator),
# и запись html-разметок для каждой буквы в файлы (write_to_files)
print("start processing...\n")

rwFunc.write_to_files(
    processing.letters_html_generator(
        processing.words_html_args_generator(
            rwFunc.words_reader(table),
            processing.create_fill_args_func_dict(
                {('ADV', 'ADVPRO', 'CONJ', 'INTJ', 'PART', 'PR',
                  'Звукоподражание'):
                     partsProcFunc.get_args_for_inv_part,
                 ('SPRO', 'NUM'):
                     partsProcFunc.get_args_for_SPRO_and_NUM,
                 "ANUM":
                     partsProcFunc.get_args_for_ANUM,
                 "APRO":
                     partsProcFunc.get_args_for_APRO,
                 "S":
                     partsProcFunc.get_args_for_S,
                 "A":
                     partsProcFunc.get_args_for_A,
                 "V":
                     partsProcFunc.get_args_for_V,
                }),
            "Resources\\PartsPattern"),
        "Resources\\DecoratingPattern"),
    "Result")


print("\nready---------------------------------------\n")


# вывод статистики о результатах обработки
print("Количество считанных из таблицы строк:", rwFunc.read_str_counter)


print("\n\nКоличество обработанных слов по частям речи:\n")
proc = processing.stat.proc_parts
[print(k + " : ", len(proc[k])) for k in sorted(proc.keys())]

print("\n\nКоличество необработанных слов по частям речи:\n")
not_proc = processing.stat.not_proc_parts
[print(k + " : ", len(not_proc[k])) for k in sorted(not_proc.keys())]





