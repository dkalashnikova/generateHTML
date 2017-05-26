# модуль, содержащий определения подстановочных функий для разных частей речи
# и некоторых вспомогательных функций

import rwFunc
from helpFunc import set_el


# считывание шаблона для ссылки
_reference = rwFunc.read_file(
    "Resources\\DecoratingPattern\\reference.html")
    

# функция, возвращающая html-код ссылки на слово, если ссылка
# присутствует в таблице, иначе просто возвращает это слово
def word_ref_gen(word, reference_string):

    if ((reference_string != '') and (reference_string != '\n')):
        return _reference.format(reference_string, word)
    else:
        return word



# функция, прнимающая список всех возможных значений грамматического признака
# и возвращающая одно из них, если оно присутствует в списке грамматических
# признаков gramm_info формы
def ftr_val(gramm_info, feature_values):
    if gramm_info:
        for f_val in feature_values:
            if f_val in gramm_info:
                return f_val
    return None



# функция, добавляющая новую форму val в таблицу подстановок (список lst)
# в позицию indxs (использует set_el из helpFunc), причем если в этой
# ячейке уже была записана какая-то форма, то добавляет новую форму
# через тег <br>
def set_form(lst, indxs, val):
    set_el(lst, indxs, val, lambda el, v: el + "<br>" + v)





# ----------- Подстановочные функции ----------------------------

# (возвращают слово, html-шаблон для него, и аргументы для подстановки
# в html-шаблон дл этого слова (аргументы для подстановки -
# это, например, само слово, его признаки и его формы,
# определенным образом структурированные в списках))


# подстановочная функция для неизменяемых частей речи
def get_args_for_inv_part(data):
    
    return (data.word.title(), data.word_info,
            word_ref_gen(data.forms_list[0].form.lower(),
                         data.forms_list[0].reference))



# подстановочная функция для NUM
def get_args_for_SPRO_and_NUM(data):

    forms = data.forms_list
    
    sub_dict_case = {'им': 0,
                     'род': 1,
                     'дат': 2,
                     'вин': 3,
                     'твор': 4,
                     'пр': 5}
    
    case_vals = sub_dict_case.keys()

    table_args = [None] * 6
    
    for f in forms:
        case = ftr_val(f.gramm_info, case_vals)
        if case:
            set_form(table_args,
                     (sub_dict_case[case],),
                     word_ref_gen(f.form.lower(), f.reference))

    table_args = list(map(lambda val: val if val else '-', table_args))

    return (data.word.title(), data.word_info, table_args)
    



# подстановочная функция для ANUM
def get_args_for_ANUM(data):

    forms = data.forms_list
    
    sub_dict_case = {'им': 0,
                     'род': 1,
                     'дат': 2,
                     'вин': 3,
                     'твор': 4,
                     'пр': 5}

    sub_dict_num_gen = {('ед', 'муж'): 0,
                        ('ед', 'сред'): 1,
                        ('ед', 'жен'): 2,
                        ('мн', None): 3}
    
    case_vals = sub_dict_case.keys()
    num_vals = ['ед', 'мн']
    gen_vals = ['муж', 'сред', 'жен']

    table_args = [[None] * 4 for i in range(6)]
    
    for f in forms:
        case = ftr_val(f.gramm_info, case_vals)
        if case:
            num = ftr_val(f.gramm_info, num_vals)
            if num:
                gen = ftr_val(f.gramm_info, gen_vals)
                
                if ((gen or (num == 'мн')) and
                    ((num, gen) in sub_dict_num_gen)):
                    
                    set_form(table_args,
                             (sub_dict_case[case],
                                  sub_dict_num_gen[(num, gen)]),
                             word_ref_gen(f.form.lower(), f.reference))

    for i in range(len(table_args)):
        table_args[i] = list(map(lambda val: val if val else '-',
                                 table_args[i]))

    return (data.word.title(), data.word_info, table_args)



# подстановочная функция для APRO
def get_args_for_APRO(data):

    forms = data.forms_list
    
    sub_dict_case = {'им': 0,
                     'род': 1,
                     'дат': 2,
                     'вин': 3,
                     'твор': 4,
                     'пр': 5,
                     'кр': 6}

    sub_dict_num_gen = {('ед', 'муж'): 0,
                        ('ед', 'сред'): 1,
                        ('ед', 'жен'): 2,
                        ('мн', None): 3}
    
    case_vals = sub_dict_case.keys()
    num_vals = ['ед', 'мн']
    gen_vals = ['муж', 'сред', 'жен']

    table_args = [[None] * 4 for i in range(7)]
    
    for f in forms:
        case = ftr_val(f.gramm_info, case_vals)
        if case:
            num = ftr_val(f.gramm_info, num_vals)
            if num:
                gen = ftr_val(f.gramm_info, gen_vals)
                
                if ((gen or (num == 'мн')) and
                    ((num, gen) in sub_dict_num_gen)):
                    
                    set_form(table_args,
                             (sub_dict_case[case],
                                  sub_dict_num_gen[(num, gen)]),
                             word_ref_gen(f.form.lower(), f.reference))

    for i in range(len(table_args)):
        table_args[i] = list(map(lambda val: val if val else '-',
                                 table_args[i]))

    return (data.word.title(), data.word_info, table_args)





# регулярка для распознавания имен собственных
import re
p_name = re.compile(r"имя|фам|отч|гео|собств|топ", re.IGNORECASE)


# подстановочная функция для существительных
def get_args_for_S(data):

    forms = data.forms_list
    
    sub_dict_case = {'им': 0,
                     'род': 1,
                     'дат': 2,
                     'вин': 3,
                     'твор': 4,
                     'пр': 5}

    sub_dict_num = {'ед': 0,
                    'мн': 1}
    
    case_vals = sub_dict_case.keys()
    num_vals = sub_dict_num.keys()

    table_args = [[None] * 2 for i in range(6)]
    
    for f in forms:
        case = ftr_val(f.gramm_info, case_vals)
        if case:
            num = ftr_val(f.gramm_info, num_vals)
            if num:        
                set_form(table_args,
                         (sub_dict_case[case], sub_dict_num[num]),
                         word_ref_gen(f.form
                                      if p_name.search(data.word_info)
                                      else f.form.lower(),
                                      f.reference))

    for i in range(len(table_args)):
        table_args[i] = list(map(lambda val: val if val else '-',
                                 table_args[i]))

    return (data.word.title(), data.word_info, table_args)






# подстановочная функция для прилагательного
def get_args_for_A(data):
    
    forms = data.forms_list
    
    sub_dict_case = {'им': 0,
                     'род': 1,
                     'дат': 2,
                     'вин': 3,
                     'твор': 4,
                     'пр': 5}

    sub_dict_num_gen = {('ед', 'муж'): 0,
                        ('ед', 'сред'): 1,
                        ('ед', 'жен'): 2,
                        ('мн', None): 3}
    
    case_vals = sub_dict_case.keys()
    num_vals = ['ед', 'мн']
    gen_vals = ['муж', 'сред', 'жен']

    table_args = [[None] * 4 for i in range(8)]
    table_args.append([None])

    need_pr_table = False
    
    for f in forms:

        if ftr_val(f.gramm_info, ['срав'])  :
            set_form(table_args, (8, 0),
                     word_ref_gen(f.form
                                  if p_name.search(data.word_info)
                                  else f.form.lower(),
                                  f.reference))
            continue

        row_ind = None
        
        if ftr_val(f.gramm_info, ['прев']):
            need_pr_table = True
            row_ind = 7
            
        elif ftr_val(f.gramm_info, ['кр']):
            row_ind = 6

        else:            
            case = ftr_val(f.gramm_info, case_vals)
            if case:
                row_ind = sub_dict_case[case]


        if (row_ind != None):
            num = ftr_val(f.gramm_info, num_vals)
            if num:
                gen = ftr_val(f.gramm_info, gen_vals)
                
                if ((gen or (num == 'мн')) and
                    ((num, gen) in sub_dict_num_gen)):

                    set_form(table_args,
                             (row_ind, sub_dict_num_gen[(num, gen)]),
                             word_ref_gen(f.form
                                          if p_name.search(data.word_info)
                                          else f.form.lower(),
                                          f.reference))


    for i in range(len(table_args)):
        table_args[i] = list(map(lambda val: val if val else '-',
                                 table_args[i]))

    pr_table = get_prevoshod_table(data) if need_pr_table else ''

    return (data.word.title(), data.word_info, table_args, pr_table)   




# шаблон таблицы для прилагательного в превосходной степени
prevoshod_patt = rwFunc.read_file(
    "Resources\\PartsPattern\\prevoshod.html")


# функция, возвращающая html-таблицу
# для прилагательного в превосходной степени
def get_prevoshod_table(data):

    forms = [form for form in data.forms_list
             if ftr_val(form.gramm_info, ['прев'])]
    
    sub_dict_case = {'им': 0,
                     'род': 1,
                     'дат': 2,
                     'вин': 3,
                     'твор': 4,
                     'пр': 5,
                     'кр': 6}

    sub_dict_num_gen = {('ед', 'муж'): 0,
                        ('ед', 'сред'): 1,
                        ('ед', 'жен'): 2,
                        ('мн', None): 3}
    
    case_vals = sub_dict_case.keys()
    num_vals = ['ед', 'мн']
    gen_vals = ['муж', 'сред', 'жен']

    table_args = [[None] * 4 for i in range(7)]
    
    for f in forms:
        case = ftr_val(f.gramm_info, case_vals)
        if case:
            num = ftr_val(f.gramm_info, num_vals)
            if num:
                gen = ftr_val(f.gramm_info, gen_vals)
                
                if ((gen or (num == 'мн')) and
                    ((num, gen) in sub_dict_num_gen)):
                    
                    set_form(table_args,
                             (sub_dict_case[case],
                                  sub_dict_num_gen[(num, gen)]),
                             word_ref_gen(f.form.lower(), f.reference))

    for i in range(len(table_args)):
        table_args[i] = list(map(lambda val: val if val else '-',
                                 table_args[i]))

    return prevoshod_patt.format(table_args)







# подстановочная функция для глагола
def get_args_for_V(data):
    
    forms = data.forms_list
    
    sub_dict_time = {'непрош': 0,
                     'прош': 1,
                     'пов': 2}

    sub_dict_sd = {'действ': 6,
                   'страд': 7}

    sub_dict_L = {('1-л', 'ед'): 0,
                  ('2-л', 'ед'): 1,
                  ('3-л', 'ед'): 2,
                  ('1-л', 'мн'): 3,
                  ('2-л', 'мн'): 4,
                  ('3-л', 'мн'): 5}
    
    time_vals = sub_dict_time.keys()
    sd_vals = sub_dict_sd.keys()

    table_args = [[None] * 3, [None] * 3, [None] * 4]
    table_args += [[None] * 3 for i in range(5)]
    table_args += [[None] * 2, [None]]

    need_deystv_pr_table = False
    need_strad_pr_table = False
    
    for f in forms:

        row_ind = None
        col_ind = None

        time = ftr_val(f.gramm_info, time_vals)

        if ftr_val(f.gramm_info, ['деепр']):
            row_ind = 8
        
        elif ftr_val(f.gramm_info, ['прич']):
            strad_or_deystv = ftr_val(f.gramm_info, sd_vals)
            if strad_or_deystv:
                row_ind = sub_dict_sd[strad_or_deystv]
                if strad_or_deystv == 'действ':
                    row_ind = 6
                    need_deystv_pr_table = True
                else:
                    need_strad_pr_table = True
                    row_ind = 7

        else:
            num = ftr_val(f.gramm_info, ['мн', 'ед'])
            if time == 'прош':
                if num == 'ед':
                    set_form(table_args, (0, 1),
                             word_ref_gen(f.form.lower(), f.reference))

                elif num == 'мн':
                    for i in range(3,6):
                        set_form(table_args, (i, 1),
                                 word_ref_gen(f.form.lower(), f.reference))
                continue

            elif time and num:
                L = ftr_val(f.gramm_info, ['1-л', '2-л', '3-л'])
                if L:
                    row_ind = sub_dict_L[(L, num)]

        if time and row_ind:
            col_ind = sub_dict_time[time]
            
            if not (time == 'повелит' and row_ind == 8):
                set_form(table_args, (row_ind, col_ind),
                         word_ref_gen(f.form.lower(), f.reference))
                

                
    for i in range(len(table_args)):
        table_args[i] = list(map(lambda val: val if val else '-',
                                 table_args[i]))

    deystv_pr_table = get_prich_table(data, 'действ') \
                      if need_deystv_pr_table else ''

    strad_pr_table = get_prich_table(data, 'страд') \
                     if need_strad_pr_table else ''

    return (data.word.title(), data.word_info, table_args,
            deystv_pr_table, strad_pr_table) 




# шаблон таблицы для причастий
prich_patt = rwFunc.read_file(
    "Resources\\PartsPattern\\prich.html")


# функция, возвращающая html-таблицу для страд. или действ. причастия
def get_prich_table(data, strad_or_deystv):

    forms = [form for form in data.forms_list
             if ftr_val(form.gramm_info, ['прич'])]

    forms = [form for form in forms
             if ftr_val(form.gramm_info, [strad_or_deystv])]
    
    sub_dict_case = {'им': 0,
                     'род': 1,
                     'дат': 2,
                     'вин': 3,
                     'твор': 4,
                     'пр': 5,
                     'кр': 6}

    sub_dict_num_gen = {('ед', 'муж'): 0,
                        ('ед', 'сред'): 1,
                        ('ед', 'жен'): 2,
                        ('мн', None): 3}
    
    case_vals = sub_dict_case.keys()
    num_vals = ['ед', 'мн']
    gen_vals = ['муж', 'сред', 'жен']

    table_args = [[None] * 4 for i in range(7)]
    
    for f in forms:
        case = ftr_val(f.gramm_info, case_vals)
        if case:
            num = ftr_val(f.gramm_info, num_vals)
            if num:
                gen = ftr_val(f.gramm_info, gen_vals)
                
                if ((gen or (num == 'мн')) and
                    ((num, gen) in sub_dict_num_gen)):
                    
                    set_form(table_args,
                             (sub_dict_case[case],
                                  sub_dict_num_gen[(num, gen)]),
                             word_ref_gen(f.form.lower(), f.reference))

    for i in range(len(table_args)):
        table_args[i] = list(map(lambda val: val if val else '-',
                                 table_args[i]))

    return prich_patt.format(table_args)







